import {useState} from "react";

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

interface CorrespondenceCardProps {
    instanceId: string;
}

const columnHelper = createColumnHelper<Correspondence>();
function disableLinks(html: string): string {
    const style = "<style>a{pointer-events:none!important;cursor:default!important;}</style>";
    return html.includes("</head>") ? html.replace("</head>", `${style}</head>`) : style + html;
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

    const columns = [
        columnHelper.accessor("subject", {
            header: t("correspondence.subject"),
            cell: (info) => {
                const subject = info.getValue();
                return (
                    <Link
                        className="underline"
                        onClick={() =>
                            setSelectedMail({
                                ...info.row.original,
                                attachments: [
                                    "attachment_with_a_very_long_name_1.pdf",
                                    "attachment_another_attachment_2.pdf",
                                    "attachment_with_a_very_long_name_1.pdf",
                                ],
                            })
                        }
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
            enableSorting: false,
        }),
        columnHelper.accessor("recipients", {
            header: t("correspondence.recipients"),
            cell: (info) => {
                const recipients = info.getValue();
                if (!recipients || recipients.length === 0) return <Text>—</Text>;

                return (
                    <div className="flex flex-col gap-1">
                        {recipients.map((r) => (
                            <Tooltip content={r.email} key={r.email}>
                                <Text key={`${r.type}-${r.email}`}>{`${r.type}: ${r.name}`}</Text>
                            </Tooltip>
                        ))}
                    </div>
                );
            },
            enableSorting: false,
        }),
    ];

    return (
        <>
            <Disclosure isExpanded={isExpanded} onExpandedChange={setIsExpanded}>
                <Disclosure.Header>
                    <Heading className="font-semibold">{t("correspondence.title")}</Heading>
                </Disclosure.Header>
                <Disclosure.Content>
                    {isFetching ? (
                        <div className="flex flex-col gap-4">
                            <Skeleton className="h-6 w-32" />
                            <Separator />
                            <div className="flex items-center gap-8">
                                <Skeleton className="h-5 w-24" />
                                <Skeleton className="h-4 flex-1" />
                            </div>
                        </div>
                    ) : data && data.length > 0 ? (
                        <DataTable
                            data={data}
                            columns={columns}
                            getRowId={(_row, index) => String(index)}
                            emptyNode={
                                <Text className="px-4 pb-4">{t("correspondence.empty")}</Text>
                            }
                        />
                    ) : (
                        <Text className="px-4 pb-4">{t("correspondence.empty")}</Text>
                    )}
                </Disclosure.Content>
            </Disclosure>
            <Modal isOpen={!!selectedMail} onOpenChange={() => setSelectedMail(null)} size="xl">
                <Modal.Header
                    subTitle={
                        selectedMail
                            ? formatDateTimeShort(selectedMail.timestamp, i18n.language)
                            : undefined
                    }
                >
                    <Heading className="font-semibold">
                        {selectedMail?.subject
                            ? `${t("correspondence.subject")}: ${selectedMail.subject}`
                            : t("correspondence.subject")}
                    </Heading>
                </Modal.Header>
                <Modal.Body>
                    <div className="flex flex-col gap-4">
                        <iframe
                            title={
                                selectedMail?.subject
                                    ? `${t("correspondence.content")}: ${selectedMail.subject}`
                                    : t("correspondence.content")
                            }
                            srcDoc={
                                selectedMail?.body
                                    ? disableLinks(selectedMail.body)
                                    : t("correspondence.empty")
                            }
                            sandbox=""
                            className="h-[40vh] w-full rounded border border-grey-200"
                        />
                        {selectedMail?.attachments && selectedMail.attachments.length > 0 && (
                            <div className="flex flex-wrap justify-start gap-2">
                                {selectedMail.attachments.map((attachment) => (
                                    <div
                                        className="flex w-fit items-center gap-4 rounded-lg bg-grey-200 p-2"
                                        key={attachment}
                                    >
                                        <Icon name="attachment-line" />
                                        <Text key={attachment}>{attachment}</Text>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </Modal.Body>
            </Modal>
        </>
    );
}
