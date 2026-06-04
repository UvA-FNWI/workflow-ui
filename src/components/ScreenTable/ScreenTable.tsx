import {useMemo} from "react";

import {type ColumnDef} from "@tanstack/react-table";
import {Button, Icon, linkClassGenerator} from "@uva-fnwi/datanose-ui";

import {DataTable} from "~/components/Table";
import {VersionedLink} from "~/components/VersionedLink";
import {type LocalString, useTranslate} from "~/hooks/useTranslate";
import {useVersionedNavigate} from "~/hooks/useVersionedNavigate";
import type {ScreenColumn, ScreenRow} from "~/store/api/types/screens";

type ScreenTableProps = {
    columns: ScreenColumn[];
    rows: ScreenRow[];
    globalFilter?: string;
};

export const ScreenTable = ({columns, rows, globalFilter = ""}: ScreenTableProps) => {
    const {i18n, l, t} = useTranslate("workflow");
    const navigate = useVersionedNavigate();

    const tableColumns = useMemo<ColumnDef<ScreenRow>[]>(
        () => [
            ...columns
                .filter((col) => col.displayType !== "ExportOnly")
                .map(
                    (col): ColumnDef<ScreenRow> => ({
                        id: String(col.id),
                        accessorFn: (row) => row.values[col.id],
                        header: () => l(col.title),
                        cell: (info) => {
                            const value = info.getValue();
                            const formattedValue = formatCellValue(
                                value,
                                col.dataType,
                                i18n.language,
                            );

                            // Custom formatting for the progress column
                            if (col.isCurrentStep && col.dataType === "Object") {
                                const obj = value as Record<string, unknown>;
                                if ("text" in obj && "color" in obj) {
                                    const progressText = obj["text"] as LocalString | undefined;
                                    const progressColor = obj["color"] as string | undefined;
                                    return (
                                        <div className="flex items-baseline gap-2">
                                            <div
                                                className={`h-2 w-2 rounded-full ${progressColor?.toLowerCase() == "green" ? "bg-green-600" : "bg-red-600"}`}
                                            />
                                            <span>{l(progressText)}</span>
                                        </div>
                                    );
                                }
                            }

                            if (col.link) {
                                const rowId = info.row.original.id;
                                return (
                                    <VersionedLink
                                        to={`/instance/${rowId}`}
                                        className={linkClassGenerator({
                                            intent: "primary",
                                            underline: true,
                                            size: "sm",
                                        })}
                                    >
                                        {formattedValue}
                                    </VersionedLink>
                                );
                            }

                            return formattedValue;
                        },
                        enableSorting: true,
                    }),
                ),
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
                                onClick={() => navigate(`/instance/${rowId}`)}
                            >
                                <Icon name="visible-line" color="current" />
                            </Button>
                        </div>
                    );
                },
            },
        ],
        [columns, i18n.language, l, t, navigate],
    );

    return <DataTable data={rows} columns={tableColumns} globalFilter={globalFilter} />;
};

function formatCellValue(value: unknown, dataType: string, locale: string): React.ReactNode {
    if (value === null || value === undefined) {
        return "—";
    }

    switch (dataType) {
        case "Date":
            return formatDate(value);
        case "DateTime":
            return formatDateTime(value);
        case "Currency":
            return formatCurrency(value);
        case "Double":
            return typeof value === "number" ? value.toLocaleString() : String(value);
        case "Int":
            return typeof value === "number" ? value.toLocaleString() : String(value);
        case "LocalString":
            return typeof value === "object" && (value as LocalString)[locale as keyof LocalString];
        case "Object": {
            if (typeof value === "object") {
                const localString = getLocalStringFromObject(value as object);
                if (localString) {
                    return localString[locale as keyof LocalString] ?? "—";
                }
            }
            return String(value);
        }
        default:
            return String(value);
    }
}

function formatDate(value: unknown): string {
    if (typeof value === "string" || typeof value === "number") {
        const date = new Date(value);
        if (!isNaN(date.getTime())) {
            return date.toLocaleDateString();
        }
    }
    return String(value);
}

function formatDateTime(value: unknown): string {
    if (typeof value === "string" || typeof value === "number") {
        const date = new Date(value);
        if (!isNaN(date.getTime())) {
            return date.toLocaleString();
        }
    }
    return String(value);
}

function formatCurrency(value: unknown): string {
    if (typeof value === "number") {
        return new Intl.NumberFormat(undefined, {
            style: "currency",
            currency: "EUR",
        }).format(value);
    }
    return String(value);
}

function getLocalStringFromObject(value: object): LocalString | null {
    for (const field of Object.values(value)) {
        if (typeof field === "object" && field !== null && !Array.isArray(field)) {
            const keys = Object.keys(field);
            if (keys.some((k) => /^[a-z]{2}(-[A-Z]{2})?$/.test(k))) {
                return field as LocalString;
            }
        }
    }
    return null;
}
