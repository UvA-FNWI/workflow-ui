import {useMemo, useState} from "react";

import {type ColumnDef} from "@tanstack/react-table";
import {Button, Icon, linkClassGenerator, Pill} from "@uva-fnwi/datanose-ui";

import {JOB_STATUS_VARIANT} from "../../utils/jobsUtils";
import {JobModal} from "./JobModal";
import {DataTable} from "~/components/Table";
import {useTranslate} from "~/hooks/useTranslate";
import type {Job, JobStatus} from "~/store/api/types/jobs";
import {formatDate} from "~/utils/formatDate";

type JobsTableProps = {
    jobs: Job[];
    instanceId: string;
    globalFilter?: string;
    refetch?: () => void;
};

export const JobsTable = ({jobs, instanceId, globalFilter = "", refetch}: JobsTableProps) => {
    const {t, i18n} = useTranslate("workflow");
    const [selectedJobId, setSelectedJobId] = useState<string | null>(null);

    const columns = useMemo<ColumnDef<Job>[]>(
        () => [
            {
                id: "sourceName",
                accessorFn: (row) => row.sourceName ?? row.sourceType,
                header: () => t("jobs.columns.source"),
                cell: ({row, getValue}) => {
                    const rowId = row.original.id;
                    const sourceValue = String(getValue<unknown>());

                    if (!rowId) {
                        return sourceValue;
                    }

                    return (
                        <button
                            type="button"
                            onClick={() => setSelectedJobId(rowId)}
                            className={linkClassGenerator({
                                intent: "primary",
                                underline: true,
                                size: "sm",
                            })}
                        >
                            {sourceValue}
                        </button>
                    );
                },
                enableSorting: true,
            },
            {
                id: "status",
                accessorKey: "status",
                header: () => t("jobs.columns.status"),
                cell: ({getValue}) => {
                    const status = getValue<JobStatus>();
                    return <Pill variant={JOB_STATUS_VARIANT[status]}>{status}</Pill>;
                },
                enableSorting: true,
            },
            {
                id: "startOn",
                accessorKey: "startOn",
                header: () => t("jobs.columns.startOn"),
                cell: ({getValue}) => formatDate(getValue<string>(), i18n.language),
                enableSorting: true,
            },
            {
                id: "executedOn",
                accessorKey: "executedOn",
                header: () => t("jobs.columns.executedOn"),
                cell: ({getValue}) => {
                    const value = getValue<string | null>();
                    return value ? formatDate(value, i18n.language) : "—";
                },
                enableSorting: true,
            },
            {
                id: "createdBy",
                accessorFn: (row) => row.createdByDisplayName ?? row.createdBy,
                header: () => t("jobs.columns.createdBy"),
                cell: ({getValue}) => getValue<string | null>() ?? "—",
                enableSorting: true,
            },
            {
                id: "message",
                accessorKey: "message",
                header: () => t("jobs.columns.message"),
                cell: ({getValue}) => {
                    const message = getValue<string | null>();
                    const display = message ?? "—";

                    return (
                        <span className="block max-w-xs truncate" title={message ?? undefined}>
                            {display}
                        </span>
                    );
                },
                enableSorting: true,
            },
            {
                id: "actions",
                header: () => <span className="sr-only">{t("screens.actions")}</span>,
                enableSorting: false,
                cell: ({row}) => {
                    const rowId = row.original.id;

                    return (
                        <div className="flex w-auto justify-end p-0">
                            <Button
                                intent="primary"
                                variant="destructive"
                                size="square"
                                width="none"
                                className="flex items-center justify-center rounded-sm text-white"
                                onClick={() => rowId && setSelectedJobId(rowId)}
                                disabled={!rowId}
                            >
                                <Icon name="visible-line" color="current" />
                            </Button>
                        </div>
                    );
                },
            },
        ],
        [i18n.language, t],
    );

    return (
        <>
            <DataTable
                data={jobs}
                columns={columns}
                globalFilter={globalFilter}
                getRowId={(row) => row.id ?? `${row.sourceType}-${row.startOn}`}
            />
            <JobModal
                jobId={selectedJobId}
                instanceId={instanceId}
                isOpen={selectedJobId !== null}
                onClose={(ranTask?: boolean) => {
                    setSelectedJobId(null);
                    if (ranTask) {
                        refetch?.();
                    }
                }}
            />
        </>
    );
};
