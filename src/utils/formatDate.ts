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
            timeZone: "Europe/Amsterdam",
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
        timeZone: "Europe/Amsterdam",
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
        timeZone: "Europe/Amsterdam",
    });
}

/**
 * Format a date with time only when the time is relevant, expressed in the
 * Amsterdam timezone. If the user's local timezone differs from Amsterdam,
 * a note is appended clarifying that the time is in Amsterdam time.
 *
 * If the parsed date resolves to 00:00 in Amsterdam time, the result is
 * formatted as a short date only. Otherwise, the result includes both date
 * and time (in Amsterdam time), plus a timezone note if applicable.
 *
 * @param date - The date to format (ISO string or Date object)
 * @param locale - The locale to use for formatting (e.g., 'en', 'nl')
 * @param amsterdamTimeNote - Translated text to append when the user's timezone differs from Amsterdam (e.g. "(Amsterdam time)")
 * @returns Formatted short date, with Amsterdam time included when relevant
 */
export function formatDateShortWithRelevantTime(
    date: string | Date,
    locale: string = "en",
    amsterdamTimeNote?: string,
): string {
    if (!hasNonDefaultAmsterdamTime(date)) {
        return formatDateShort(date, locale);
    }

    const formatted = formatDateTimeShort(date, locale);

    return Intl.DateTimeFormat().resolvedOptions().timeZone === "Europe/Amsterdam"
        ? formatted
        : `${formatted} ${amsterdamTimeNote}`;
}

/**
 * Check whether a date has a non-default time in the Amsterdam timezone.
 *
 * A default time is considered to be exactly 00:00 in Amsterdam. This is
 * useful for timezone-aware deadlines sent by the server in Amsterdam time.
 *
 * @param date - The date to inspect (ISO string or Date object)
 * @returns `true` when the Amsterdam time is not 00:00, otherwise `false`
 */
export function hasNonDefaultAmsterdamTime(date: string | Date): boolean {
    const parsedDate = typeof date === "string" ? new Date(date) : date;

    if (isNaN(parsedDate.getTime())) {
        return false;
    }

    const time = parsedDate.toLocaleTimeString("en-GB", {
        timeZone: "Europe/Amsterdam",
        hour: "2-digit",
        minute: "2-digit",
        hourCycle: "h23",
    });

    return time !== "00:00";
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
