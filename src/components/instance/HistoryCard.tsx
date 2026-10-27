import {useMemo, useState} from "react";

import {createColumnHelper} from "@tanstack/react-table";
import {Disclosure, Heading, Link, Separator, Skeleton, Text, Tooltip} from "@uva-fnwi/datanose-ui";
import i18n from "i18next";

import {AnswerChangesModal} from "~/components/instance/AnswerChangesModal.tsx";
import {DataTable} from "~/components/Table";
import {useTranslate} from "~/hooks/useTranslate";
import {instancesEndpoints} from "~/store/api/instancesApi.ts";
import type {InstanceHistoryItem, PropertyHistory} from "~/store/api/types/instances.ts";
import {formatDateTimeShort} from "~/utils/formatDate.ts";

const columnHelper = createColumnHelper<InstanceHistoryItem>();

interface HistoryCardProps {
    instanceId: string;
}

export function HistoryCard({instanceId}: HistoryCardProps) {
    const [isExpanded, setIsExpanded] = useState(false);
    const {t, l} = useTranslate("workflow");
    const [propertyHistory, setPropertyHistory] = useState<PropertyHistory | null>(null);

    const {data, isFetching, error} = instancesEndpoints.getHistory.useQuery(instanceId ?? "", {
        skip: !instanceId || !isExpanded,
    });

    if (error) throw error;

    const columns = useMemo(
        () => [
            columnHelper.accessor("title", {
                header: t("history.status"),
                cell: (info) => {
                    const status = info.getValue();
                    const type = info.row.original.type;
                    if (type === "Property") {
                        return (
                            <Link
                                className="underline"
                                onClick={() =>
                                    setPropertyHistory(info.row.original.propertyHistory ?? null)
                                }
                            >
                                {l(status) || "—"}
                            </Link>
                        );
                    }
                    return <Text>{l(status) || "—"} </Text>;
                },
                enableSorting: false,
            }),
            columnHelper.accessor("timestamp", {
                header: t("date"),
                cell: (info) => {
                    const date = info.getValue();
                    return <Text>{date ? formatDateTimeShort(date, i18n.language) : "—"}</Text>;
                },
                sortDescFirst: true,
            }),
            columnHelper.accessor("user", {
                header: t("history.by"),
                cell: (info) => {
                    const user = info.getValue();
                    if (!user) return <Text>—</Text>;

                    return (
                        <div className="flex flex-col items-start gap-1">
                            <Tooltip content={user.email} className="w-fit">
                                <Text>{user.displayName}</Text>
                            </Tooltip>
                        </div>
                    );
                },
                enableSorting: false,
            }),
        ],
        [t, l],
    );

    return (
        <>
            <Disclosure isExpanded={isExpanded} onExpandedChange={setIsExpanded}>
                <Disclosure.Header>
                    <Heading className="font-semibold">{t("history.title")}</Heading>
                </Disclosure.Header>
                <Disclosure.Content>
                    <div className="px-2 py-4">
                        {isFetching ? (
                            <div className="flex flex-col gap-4">
                                <div className="flex items-center gap-4">
                                    <Skeleton className="h-6 flex-1" />
                                    <Skeleton className="h-6 flex-1" />
                                    <Skeleton className="h-6 flex-1" />
                                </div>
                                <Separator />
                                <Skeleton className="h-6" />
                                <Skeleton className="h-6" />
                                <Skeleton className="h-6" />
                            </div>
                        ) : (
                            <DataTable
                                data={data ?? []}
                                columns={columns}
                                getRowId={(row) => row.id}
                                emptyNode={<Text className="italic">{t("history.empty")}</Text>}
                                textSize="base"
                            />
                        )}
                    </div>
                </Disclosure.Content>
            </Disclosure>
            {propertyHistory?.answerChangeGroup && (
                <AnswerChangesModal
                    isOpen
                    onClose={() => setPropertyHistory(null)}
                    question={propertyHistory.question}
                    changes={[propertyHistory.answerChangeGroup]}
                />
            )}
        </>
    );
}
