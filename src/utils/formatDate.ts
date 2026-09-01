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
            hour: "2-digit",
            minute: "2-digit",
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
 * Format a datetime string or Date object for display
 * @param date - The datetime to format (ISO string or Date object)
 * @param locale - The locale to use for formatting (e.g., 'en', 'nl')
 * @returns Formatted datetime string
 */
export function formatDateTimeShort(date: string | Date, locale: string = "en"): string {
    return formatDate(date, locale, {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
    });
}

/**
 * Format a date with time only when the time is relevant in the user's local timezone.
 *
 * If the parsed date resolves to 00:00 in the browser's local timezone, the result is
 * formatted as a short date only. Otherwise, the result includes both date and time.
 *
 * @param date - The date to format (ISO string or Date object)
 * @param locale - The locale to use for formatting (e.g., 'en', 'nl')
 * @returns Formatted short date, with time included only when local time is not 00:00
 */
export function formatDateShortWithRelevantTime(
    date: string | Date,
    locale: string = "en",
): string {
    return hasNonDefaultLocalTime(date)
        ? formatDateTimeShort(date, locale)
        : formatDateShort(date, locale);
}

/**
 * Check whether a date has a non-default time in the user's local timezone.
 *
 * A default time is considered to be exactly 00:00 after the date has been converted
 * to the browser's local timezone. This is useful for timezone-aware deadlines:
 * a deadline at 00:00 in Amsterdam may still show as 23:00 for a user in London.
 *
 * @param date - The date to inspect (ISO string or Date object)
 * @returns `true` when the local time is not 00:00, otherwise `false`
 */
export function hasNonDefaultLocalTime(date: string | Date) {
    const parsedDate = typeof date === "string" ? new Date(date) : date;

    if (isNaN(parsedDate.getTime())) {
        return false;
    }

    return parsedDate.getHours() !== 0 || parsedDate.getMinutes() !== 0;
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
