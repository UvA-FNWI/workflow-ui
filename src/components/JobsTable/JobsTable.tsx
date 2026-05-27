import {useMemo, useState} from "react";

import {type ColumnDef} from "@tanstack/react-table";
import {Pill} from "@uva-fnwi/datanose-ui";

import {JobModal} from "./JobModal";
import {STATUS_VARIANT} from "./jobsTableUtils";
import {DataTable} from "~/components/Table";
import {useTranslate} from "~/hooks/useTranslate";
import type {Job, JobStatus} from "~/store/api/types/jobs";
import {formatDate} from "~/utils/formatDate";

type JobsTableProps = {
    jobs: Job[];
    instanceId: string;
    globalFilter?: string;
};

export const JobsTable = ({jobs, instanceId, globalFilter = ""}: JobsTableProps) => {
    const {t, i18n} = useTranslate("workflow");
    const [selectedJobId, setSelectedJobId] = useState<string | null>(null);

    const columns = useMemo<ColumnDef<Job>[]>(
        () => [
            {
                id: "sourceName",
                accessorFn: (row) => row.sourceName ?? row.sourceType,
                header: () => t("jobs.columns.source"),
                enableSorting: true,
            },
            {
                id: "status",
                accessorKey: "status",
                header: () => t("jobs.columns.status"),
                cell: ({getValue}) => {
                    const status = getValue<JobStatus>();
                    return <Pill variant={STATUS_VARIANT[status]}>{status}</Pill>;
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
                cell: ({getValue}) => getValue<string | null>() ?? "—",
                enableSorting: true,
            },
        ],
        [i18n.language, t],
    );

    const handleRowClick = (job: Job) => {
        if (job.id) {
            setSelectedJobId(job.id);
        }
    };

    return (
        <>
            <DataTable
                data={jobs}
                columns={columns}
                globalFilter={globalFilter}
                getRowId={(row) => row.id ?? `${row.sourceType}-${row.startOn}`}
                onRowClick={handleRowClick}
            />
            <JobModal
                jobId={selectedJobId}
                instanceId={instanceId}
                isOpen={selectedJobId !== null}
                onClose={() => setSelectedJobId(null)}
            />
        </>
    );
};
