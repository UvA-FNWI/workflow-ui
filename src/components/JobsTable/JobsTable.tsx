import {useMemo} from "react";

import {type ColumnDef} from "@tanstack/react-table";
import {Pill, type PillVariantProps} from "@uva-fnwi/datanose-ui";

import {DataTable} from "~/components/Table";
import {useTranslate} from "~/hooks/useTranslate";
import type {Job, JobStatus} from "~/store/api/types/jobs";
import {formatDate} from "~/utils/formatDate";

type JobsTableProps = {
    jobs: Job[];
    globalFilter?: string;
};

const STATUS_VARIANT: Record<JobStatus, PillVariantProps["variant"]> = {
    Pending: "grey",
    Running: "orange",
    Completed: "green",
    Failed: "red",
};

export const JobsTable = ({jobs, globalFilter = ""}: JobsTableProps) => {
    const {t, i18n} = useTranslate("workflow");

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
                accessorKey: "createdBy",
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

    return (
        <DataTable
            data={jobs}
            columns={columns}
            globalFilter={globalFilter}
            getRowId={(row) => row.id ?? `${row.sourceType}-${row.startOn}`}
        />
    );
};
