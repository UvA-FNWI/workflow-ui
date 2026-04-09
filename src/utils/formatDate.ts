/**
 * Format a date string or Date object for display
 * @param date - The date to format (ISO string or Date object)
 * @param locale - The locale to use for formatting (e.g., 'en', 'nl')
 * @param options - Optional Intl.DateTimeFormatOptions for customization
 * @returns Formatted date string
 */
export function formatDate(
    date: string | Date,
    locale: string = "en",
    options?: Intl.DateTimeFormatOptions,
): string {
    try {
        const dateObj = typeof date === "string" ? new Date(date) : date;

        if (isNaN(dateObj.getTime())) {
            return "Invalid date";
        }

        const defaultOptions: Intl.DateTimeFormatOptions = {
            year: "numeric",
            month: "long",
            day: "numeric",
            hour: undefined,
            minute: undefined,
            ...options,
        };

        return new Intl.DateTimeFormat(locale === "en" ? "en-GB" : locale, defaultOptions).format(
            dateObj,
        );
    } catch (error) {
        console.error("Error formatting date:", error);
        return "Invalid date";
    }
}

/**
 * Format a date string or Date object for display (date only, no time)
 * @param date - The date to format (ISO string or Date object)
 * @param locale - The locale to use for formatting (e.g., 'en', 'nl')
 * @returns Formatted date string
 */
export function formatDateShort(date: string | Date, locale: string = "en"): string {
    return formatDate(date, locale, {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: undefined,
        minute: undefined,
    });
}

/**
 * Format a date as relative time (e.g., "2 hours ago", "in 3 days")
 * @param date - The date to format (ISO string or Date object)
 * @param locale - The locale to use for formatting (e.g., 'en', 'nl')
 * @returns Relative time string
 */
export function formatRelativeTime(date: string | Date, locale: string = "en"): string {
    try {
        const dateObj = typeof date === "string" ? new Date(date) : date;

        if (isNaN(dateObj.getTime())) {
            return "Invalid date";
        }

        const now = new Date();
        const diffInSeconds = Math.floor((dateObj.getTime() - now.getTime()) / 1000);
        const absDiff = Math.abs(diffInSeconds);

        // Determine the appropriate unit
        let value: number;
        let unit: Intl.RelativeTimeFormatUnit;

        if (absDiff < 60) {
            value = diffInSeconds;
            unit = "second";
        } else if (absDiff < 3600) {
            value = Math.floor(diffInSeconds / 60);
            unit = "minute";
        } else if (absDiff < 86400) {
            value = Math.floor(diffInSeconds / 3600);
            unit = "hour";
        } else if (absDiff < 2592000) {
            value = Math.floor(diffInSeconds / 86400);
            unit = "day";
        } else if (absDiff < 31536000) {
            value = Math.floor(diffInSeconds / 2592000);
            unit = "month";
        } else {
            value = Math.floor(diffInSeconds / 31536000);
            unit = "year";
        }

        const rtf = new Intl.RelativeTimeFormat(locale, {numeric: "auto"});
        return rtf.format(value, unit);
    } catch (error) {
        console.error("Error formatting relative time:", error);
        return "Invalid date";
    }
}
