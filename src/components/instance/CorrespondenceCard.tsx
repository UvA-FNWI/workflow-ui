import {useMemo, useState} from "react";

import {createColumnHelper} from "@tanstack/react-table";
import {
    Disclosure,
    Heading,
    Icon,
    Link,
    Modal,
    Separator,
    Skeleton,
    Text,
    Tooltip,
} from "@uva-fnwi/datanose-ui";
import i18n from "i18next";

import {DataTable} from "~/components/Table";
import {useTranslate} from "~/hooks/useTranslate";
import {instancesEndpoints} from "~/store/api/instancesApi.ts";
import type {Correspondence} from "~/store/api/types/correspondence.ts";
import {formatDateTimeShort} from "~/utils/formatDate.ts";

const columnHelper = createColumnHelper<Correspondence>();

function disableLinks(html: string): string {
    const doc = new DOMParser().parseFromString(html, "text/html");
    const style = doc.createElement("style");
    style.textContent = "a{pointer-events:none!important;cursor:default!important;}";
    doc.head.appendChild(style);
    return doc.documentElement.outerHTML;
}

interface CorrespondenceCardProps {
    instanceId: string;
}

export function CorrespondenceCard({instanceId}: CorrespondenceCardProps) {
    const [isExpanded, setIsExpanded] = useState(false);
    const [selectedMail, setSelectedMail] = useState<Correspondence | null>(null);
    const {t} = useTranslate("workflow");
    const {data, isFetching, error} = instancesEndpoints.getCorrespondence.useQuery(
        instanceId ?? "",
        {
            skip: !instanceId || !isExpanded,
        },
    );
    if (error) throw error;

    const columns = useMemo(
        () => [
            columnHelper.accessor("subject", {
                header: t("correspondence.subject"),
                cell: (info) => {
                    const subject = info.getValue();
                    return (
                        <Link
                            className="underline"
                            onClick={() => setSelectedMail(info.row.original)}
                        >
                            {subject || "—"}
                        </Link>
                    );
                },
                enableSorting: false,
            }),
            columnHelper.accessor("timestamp", {
                header: t("correspondence.date"),
                cell: (info) => {
                    const date = info.getValue();
                    return <Text>{date ? formatDateTimeShort(date, i18n.language) : "—"}</Text>;
                },
                sortDescFirst: true,
            }),
            columnHelper.accessor("recipients", {
                header: t("correspondence.recipients"),
                cell: (info) => {
                    const recipients = info.getValue();
                    if (!recipients || recipients.length === 0) return <Text>—</Text>;

                    return (
                        <div className="flex flex-col items-start gap-1">
                            {recipients.map((r) => (
                                <Tooltip
                                    content={r.email}
                                    key={`${r.type}-${r.email}`}
                                    className="w-fit"
                                >
                                    <div className="flex flex-row gap-1">
                                        <Text className="text-grey-700">{`${r.type}:`}</Text>
                                        <Text>{r.name}</Text>
                                    </div>
                                </Tooltip>
                            ))}
                        </div>
                    );
                },
                enableSorting: false,
            }),
        ],
        [t],
    );

    return (
        <>
            <Disclosure isExpanded={isExpanded} onExpandedChange={setIsExpanded}>
                <Disclosure.Header>
                    <Heading className="font-semibold">{t("correspondence.title")}</Heading>
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
                                emptyNode={
                                    <Text className="italic">{t("correspondence.empty")}</Text>
                                }
                                textSize="base"
                            />
                        )}
                    </div>
                </Disclosure.Content>
            </Disclosure>
            <CorrespondenceModal selectedMail={selectedMail} setSelectedMail={setSelectedMail} />
        </>
    );
}

interface CorrespondenceModalProps {
    selectedMail: Correspondence | null;
    setSelectedMail: (mail: Correspondence | null) => void;
}

function CorrespondenceModal({selectedMail, setSelectedMail}: CorrespondenceModalProps) {
    const {t} = useTranslate("workflow");

    const disabledBody = useMemo(
        () => (selectedMail?.body ? disableLinks(selectedMail?.body) : null),
        [selectedMail],
    );

    if (!selectedMail) return null;

    return (
        <Modal isOpen={!!selectedMail} onOpenChange={() => setSelectedMail(null)} size="xl">
            <Modal.Header>{`${t("correspondence.subject")}: ${selectedMail.subject}`}</Modal.Header>
            <Modal.Body>
                <div className="flex flex-col gap-4 py-4">
                    <div className="grid w-fit grid-cols-2 gap-4">
                        <Text className="font-semibold">{`${t("correspondence.date")}:`}</Text>
                        <Text>{formatDateTimeShort(selectedMail.timestamp, i18n.language)}</Text>
                        <Text className="font-semibold">
                            {`${t("correspondence.recipients")}`}:
                        </Text>
                        <div>
                            {selectedMail.recipients.map((r) => (
                                <div key={`${r.type}-${r.email}`} className="flex flex-row gap-4">
                                    <Text className="text-grey-700">{`${r.type}:`}</Text>
                                    <Text>{`${r.name} <${r.email}> `}</Text>
                                </div>
                            ))}
                        </div>
                    </div>
                    <iframe
                        title={`${t("correspondence.content")}: ${selectedMail.subject}`}
                        srcDoc={disabledBody ?? t("correspondence.empty")}
                        sandbox=""
                        referrerPolicy="no-referrer"
                        className="my-4 h-[40vh] w-full rounded border border-grey-200"
                    />
                    {selectedMail.attachments.length > 0 && (
                        <div className="flex flex-wrap justify-start gap-2">
                            {selectedMail.attachments.map((attachment) => (
                                <div
                                    className="flex w-fit items-center gap-4 rounded-lg bg-grey-200 p-2"
                                    key={attachment}
                                >
                                    <Icon name="attachment-line" />
                                    <Text>{attachment}</Text>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </Modal.Body>
        </Modal>
    );
}
