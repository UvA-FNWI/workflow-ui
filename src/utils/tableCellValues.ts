import type {ReactNode} from "react";

import type {LocalString} from "~/hooks/useTranslate";

export function formatTableCellValue(value: unknown, dataType: string, locale: string): ReactNode {
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

export function getComparableTableCellValue(
    value: unknown,
    dataType: string,
    locale: string,
): string | number {
    if (value === null || value === undefined) {
        return "";
    }

    switch (dataType) {
        case "Date":
        case "DateTime":
            return getTimeValue(value);
        case "Currency":
        case "Double":
        case "Int":
            return typeof value === "number" ? value : String(value);
        case "LocalString":
        case "Object":
            return String(formatTableCellValue(value, dataType, locale) ?? "");
        default:
            return String(value);
    }
}

function getTimeValue(value: unknown): number | string {
    if (typeof value === "string" || typeof value === "number") {
        const date = new Date(value);
        if (!isNaN(date.getTime())) {
            return date.getTime();
        }
    }

    return String(value);
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
            if (keys.some((key) => /^[a-z]{2}(-[A-Z]{2})?$/.test(key))) {
                return field as LocalString;
            }
        }
    }
    return null;
}
