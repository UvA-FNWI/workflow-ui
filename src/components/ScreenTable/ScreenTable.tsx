import {useMemo} from "react";

import {Link} from "react-router";

import {type ColumnDef} from "@tanstack/react-table";

import {DataTable} from "~/components/Table";
import {type LocalString, useTranslate} from "~/hooks/useTranslate";
import type {ScreenColumn, ScreenRow} from "~/store/api/types/screens";

type ScreenTableProps = {
    columns: ScreenColumn[];
    rows: ScreenRow[];
    globalFilter?: string;
};

export const ScreenTable = ({columns, rows, globalFilter = ""}: ScreenTableProps) => {
    const {i18n, l} = useTranslate();

    const tableColumns = useMemo<ColumnDef<ScreenRow>[]>(
        () =>
            columns
                .filter((col) => col.displayType !== "ExportOnly")
                .map((col) => ({
                    id: String(col.id),
                    accessorFn: (row) => row.values[col.id],
                    header: () => l(col.title),
                    cell: (info) => {
                        const value = info.getValue();
                        const formattedValue = formatCellValue(value, col.dataType, i18n.language);

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
                            // TODO: Replace with Link component perhaps
                            return (
                                <Link
                                    to={`/instance/${rowId}`}
                                    className="text-blue-600 hover:text-blue-800 hover:underline"
                                >
                                    {formattedValue}
                                </Link>
                            );
                        }

                        return formattedValue;
                    },
                    enableSorting: true,
                })),
        [columns, i18n.language, l],
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
