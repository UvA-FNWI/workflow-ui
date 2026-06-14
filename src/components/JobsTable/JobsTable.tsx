import {useState} from "react";

import {createColumnHelper} from "@tanstack/react-table";
import {Button, Icon, linkClassGenerator, Pill} from "@uva-fnwi/datanose-ui";

import {JobModal} from "./JobModal";
import {DataTable} from "~/components/Table";
import {useJobTranslations} from "~/hooks/useJobTranslations";
import type {Job, JobStatus} from "~/store/api/types/jobs";
import {formatDate} from "~/utils/formatDate";
import {JOB_STATUS_VARIANT} from "~/utils/jobsUtils";

type JobsTableProps = {
    jobs: Job[];
    instanceId: string;
    globalFilter?: string;
    refetch?: () => void;
};

const columnHelper = createColumnHelper<Job>();

export const JobsTable = ({jobs, instanceId, globalFilter = "", refetch}: JobsTableProps) => {
    const {columns: columnLabels, i18n} = useJobTranslations();
    const [selectedJobId, setSelectedJobId] = useState<string | null>(null);

    const columns = [
        columnHelper.accessor("sourceName", {
            header: columnLabels.source,
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
        }),
        columnHelper.accessor("status", {
            header: columnLabels.status,
            cell: ({getValue}) => {
                const status = getValue<JobStatus>();
                return <Pill variant={JOB_STATUS_VARIANT[status]}>{status}</Pill>;
            },
        }),
        columnHelper.accessor("startOn", {
            header: columnLabels.startOn,
            cell: (info) => {
                const startOn = info.getValue();
                return startOn ? formatDate(startOn, i18n.language) : "—";
            },
        }),
        columnHelper.accessor("executedOn", {
            header: columnLabels.executedOn,
            cell: (info) => {
                const executedOn = info.getValue();
                return executedOn ? formatDate(executedOn, i18n.language) : "—";
            },
        }),
        columnHelper.accessor("createdBy", {
            header: columnLabels.createdBy,
            cell: (info) => info.getValue() || "—",
        }),
        columnHelper.accessor("message", {
            header: columnLabels.message,
            cell: (info) => info.getValue() || "—",
        }),
        columnHelper.accessor("id", {
            header: "",
            enableSorting: false,
            cell: (info) => {
                const rowId = info.getValue();

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
        }),
    ];

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
