import {useMemo, useState} from "react";

import {createColumnHelper} from "@tanstack/react-table";
import {
    Button,
    Disclosure,
    Heading,
    Link,
    Modal,
    Separator,
    Skeleton,
    Text,
    Tooltip,
} from "@uva-fnwi/datanose-ui";
import i18n from "i18next";

import {AnswerChangesModal} from "~/components/instance/AnswerChangesModal.tsx";
import {DataTable} from "~/components/Table";
import {useTranslate} from "~/hooks/useTranslate";
import {instancesEndpoints} from "~/store/api/instancesApi.ts";
import type {InstanceHistoryItem} from "~/store/api/types/instances.ts";
import {formatDateShort, formatDateTimeShort} from "~/utils/formatDate.ts";

const columnHelper = createColumnHelper<InstanceHistoryItem>();

interface HistoryCardProps {
    instanceId: string;
}

export function HistoryCard({instanceId}: HistoryCardProps) {
    const [isExpanded, setIsExpanded] = useState(false);
    const {t, l} = useTranslate("workflow");
    const [selectedItem, setSelectedItem] = useState<InstanceHistoryItem | null>(null);

    const {data, isFetching, error} = instancesEndpoints.getHistory.useQuery(instanceId ?? "", {
        skip: !instanceId || !isExpanded,
    });

    if (error) throw error;

    const isClickable = (item: InstanceHistoryItem) =>
        item.type === "Property" || item.type === "Undo";

    const columns = useMemo(
        () => [
            columnHelper.accessor("title", {
                header: t("history.status"),
                cell: (info) => {
                    const item = info.row.original;
                    return isClickable(item) ? (
                        <Link className="underline" onClick={() => setSelectedItem(item)}>
                            {l(info.getValue()) || "—"}
                        </Link>
                    ) : (
                        <Text>{l(info.getValue()) || "—"}</Text>
                    );
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
            {selectedItem?.propertyHistory && (
                <AnswerChangesModal
                    isOpen
                    onClose={() => setSelectedItem(null)}
                    question={selectedItem?.propertyHistory.question}
                    changes={[selectedItem?.propertyHistory.answerChangeGroup]}
                />
            )}
            {selectedItem?.undoHistory && (
                <UndoReasonModal isOpen onClose={() => setSelectedItem(null)} item={selectedItem} />
            )}
        </>
    );
}

type UndoReasonModalProps = {
    isOpen: boolean;
    onClose: () => void;
    item: InstanceHistoryItem;
};

const UndoReasonModal = ({isOpen, onClose, item}: UndoReasonModalProps) => {
    const {t, l} = useTranslate("workflow");

    const date = formatDateShort(item.timestamp, i18n.language);
    const text = t("instance.summary.reversed_on_by", {
        date,
        name: item.user.displayName,
    });

    return (
        <Modal isOpen={isOpen} onOpenChange={(open) => !open && onClose()} size="sm">
            <Modal.Header>{l(item.title)}</Modal.Header>
            <Modal.Body className="flex flex-col gap-4">
                <div className="flex flex-col gap-2">
                    <Text display="block" fontWeight="semibold">
                        {t("undo.reason")}
                    </Text>
                    <Text display="block" className="wrap-break-word whitespace-pre-wrap">
                        {item.undoHistory?.reason ?? t("history.undo_reason_empty")}
                    </Text>
                    <Text display="block" intent="secondary" title={date}>
                        {text}
                    </Text>
                </div>
            </Modal.Body>
            <Modal.Footer>
                <Button size="large" intent="secondary" onClick={onClose}>
                    {t("cancel")}
                </Button>
            </Modal.Footer>
        </Modal>
    );
};
