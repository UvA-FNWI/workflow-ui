import {formatDate} from "./formatDate";
import type {Choice, DataType} from "~/store/api/types/submissions";

/**
 * Format an answer value based on its data type
 * @param value - The answer value to format
 * @param type - The data type of the question
 * @param locale - The locale for formatting (e.g., 'en', 'nl')
 * @returns Formatted answer string
 */
export function formatAnswer(
    value: unknown,
    type: DataType,
    locale: string = "en",
    choices?: Choice[],
): string {
    // Handle null/undefined
    if (value == null) {
        return "";
    }

    // Handle different data types
    switch (type) {
        case "Date":
            // Format date without time
            if (typeof value === "string" || value instanceof Date) {
                return formatDate(value, locale, {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                    hour: undefined,
                    minute: undefined,
                });
            }
            return String(value);

        case "DateTime":
            // Format date with time
            if (typeof value === "string" || value instanceof Date) {
                return formatDate(value, locale);
            }
            return String(value);

        case "User":
            // Handle user/person object with displayName
            if (typeof value === "object" && value !== null) {
                const userObj = value as Record<string, unknown>;
                if ("displayName" in userObj && typeof userObj.displayName === "string") {
                    return userObj.displayName;
                }
                // Fallback to name or email if displayName is not available
                if ("name" in userObj && typeof userObj.name === "string") {
                    return userObj.name;
                }
                if ("email" in userObj && typeof userObj.email === "string") {
                    return userObj.email;
                }
            }
            return String(value);

        case "Currency":
            // Format currency
            if (typeof value === "number") {
                return new Intl.NumberFormat(locale, {
                    style: "currency",
                    currency: "EUR", // Default to EUR, could be made configurable
                }).format(value);
            }
            return String(value);

        case "Double":
        case "Int":
            // Format numbers
            if (typeof value === "number") {
                return new Intl.NumberFormat(locale).format(value);
            }
            return String(value);

        case "Choice":
            if (choices) {
                if (Array.isArray(value)) {
                    return value
                        .map((v) => {
                            const choice = choices.find((c) => c.name === v);
                            return (
                                (locale === "nl" ? choice?.text.nl : choice?.text.en) ?? String(v)
                            );
                        })
                        .join(", ");
                }
                const choice = choices.find((c) => c.name === value);
                if (choice) {
                    return (locale === "nl" ? choice.text.nl : choice.text.en) ?? String(value);
                }
            }
            return String(value);

        case "File":
            // Handle file - show filename
            if (typeof value === "object" && value !== null) {
                const fileObj = value as Record<string, unknown>;
                if ("name" in fileObj && typeof fileObj.name === "string") {
                    return fileObj.name;
                }
            }
            return String(value);

        case "Table":
            // Handle table/array data
            if (Array.isArray(value)) {
                return `${value.length} items`;
            }
            return String(value);

        case "String":
        case "Reference":
        default:
            // Default string formatting
            if (typeof value === "boolean") {
                if (locale === "nl") return value ? "Ja" : "Nee";
                return value ? "Yes" : "No";
            }
            if (Array.isArray(value)) {
                return value.join(", ");
            }
            if (typeof value === "object") {
                return JSON.stringify(value);
            }
            return String(value);
    }
}
