import {createColumnHelper} from "@tanstack/react-table";
import {Button, Pill, type PillVariantProps, Text} from "@uva-fnwi/datanose-ui";

import {DataTable} from "~/components/Table";
import {useTranslate} from "~/hooks/useTranslate";
import type {Migration, MigrationStatus} from "~/store/api/types/migrations";
import {formatDate} from "~/utils/formatDate";

export type MigrationAction = "finish" | "revert";

type MigrationsTableProps = {
    migrations: Migration[];
    globalFilter?: string;
    onAction: (migration: Migration, action: MigrationAction) => void;
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

export function MigrationsTable({migrations, globalFilter = "", onAction}: MigrationsTableProps) {
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
        columnHelper.display({
            id: "actions",
            header: t("migrations.columns.actions"),
            cell: ({row}) => {
                const migration = row.original;
                const canFinish = ["ReadyToFinish", "FinishFailed"].includes(migration.status);
                const canRevert = ["ReadyToFinish", "ApplyFailed", "RevertFailed"].includes(
                    migration.status,
                );
                if (!canFinish && !canRevert) return "—";

                return (
                    <div className="flex gap-2">
                        {canFinish && (
                            <Button
                                intent="primary"
                                size="small"
                                onClick={() => onAction(migration, "finish")}
                            >
                                {t("migrations.finish")}
                            </Button>
                        )}
                        {canRevert && (
                            <Button
                                intent="secondary"
                                variant="destructive"
                                size="small"
                                onClick={() => onAction(migration, "revert")}
                            >
                                {t("migrations.revert")}
                            </Button>
                        )}
                    </div>
                );
            },
            enableSorting: false,
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
