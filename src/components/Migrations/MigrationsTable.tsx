import {createColumnHelper} from "@tanstack/react-table";
import {Pill, type PillVariantProps, Text} from "@uva-fnwi/datanose-ui";

import {DataTable} from "~/components/Table";
import {useTranslate} from "~/hooks/useTranslate";
import type {Migration, MigrationStatus} from "~/store/api/types/migrations";
import {formatDate} from "~/utils/formatDate";

type MigrationsTableProps = {
    migrations: Migration[];
    globalFilter?: string;
};

const columnHelper = createColumnHelper<Migration>();

const statusVariants: Record<MigrationStatus, NonNullable<PillVariantProps["variant"]>> = {
    Applying: "orange",
    ReadyToFinish: "orange",
    Finishing: "orange",
    Finished: "green",
    Reverting: "orange",
    Reverted: "grey",
    ApplyFailed: "red",
    FinishFailed: "red",
    RevertFailed: "red",
};

export function MigrationsTable({migrations, globalFilter = ""}: MigrationsTableProps) {
    const {t, i18n} = useTranslate("workflow");

    const columns = [
        columnHelper.accessor((migration) => migration.definition.workflowDefinitions.join(", "), {
            id: "workflowDefinition",
            header: t("migrations.columns.workflow"),
        }),
        columnHelper.accessor(
            (migration) =>
                `${migration.definition.oldProperty} → ${migration.definition.newProperty}`,
            {
                id: "change",
                header: t("migrations.columns.change"),
            },
        ),
        columnHelper.accessor("statusLabel", {
            header: t("migrations.columns.status"),
            cell: ({row, getValue}) => (
                <div className="flex min-w-44 flex-col gap-1">
                    <Pill variant={statusVariants[row.original.status]}>{getValue()}</Pill>
                    {row.original.error && (
                        <span className="text-xs text-red-700 dark:text-red-300">
                            {row.original.error}
                        </span>
                    )}
                </div>
            ),
        }),
        columnHelper.accessor((migration) => migration.progress.itemsUpdated, {
            id: "progress",
            header: t("migrations.columns.progress"),
            cell: ({row}) => (
                <span>
                    {t("migrations.progress", {
                        updated: row.original.progress.itemsUpdated,
                        matched: row.original.progress.itemsMatched,
                    })}
                </span>
            ),
        }),
        columnHelper.accessor("requestedBy", {
            header: t("migrations.columns.requested_by"),
        }),
        columnHelper.accessor("updatedAt", {
            header: t("migrations.columns.updated"),
            cell: ({getValue}) => formatDate(getValue(), i18n.language),
        }),
    ];

    return (
        <DataTable
            data={migrations}
            columns={columns}
            globalFilter={globalFilter}
            getRowId={(migration) => migration.id}
            initialSorting={[{id: "updatedAt", desc: true}]}
            emptyNode={<Text intent="secondary">{t("migrations.empty")}</Text>}
        />
    );
}
