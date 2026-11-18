import {Text} from "@uva-fnwi/datanose-ui";

import {formatDate} from "~/utils/formatDate";

export function MessageMeta({
    displayName,
    dateTime,
    language,
    suffix,
    showDate = true,
    dateOnHover = false,
    truncate = false,
}: {
    displayName: string;
    dateTime: string;
    language: string;
    suffix?: string;
    showDate?: boolean;
    dateOnHover?: boolean;
    truncate?: boolean;
}) {
    const formattedDate = formatDate(dateTime, language);

    const line =
        truncate || !dateOnHover ? (
            <span className="block min-w-0 truncate">
                <Text as="span" fontWeight="semibold" className="text-grey-900 dark:text-white">
                    {displayName}
                </Text>
                {showDate && (
                    <>
                        <span aria-hidden="true"> · </span>
                        <time dateTime={dateTime} title={formattedDate} className="text-grey-600">
                            {formattedDate}
                        </time>
                    </>
                )}
                {suffix && (
                    <>
                        <span aria-hidden="true"> · </span>
                        <Text as="span" className="text-grey-600">
                            {suffix}
                        </Text>
                    </>
                )}
            </span>
        ) : (
            <>
                <Text as="span" fontWeight="semibold" className="text-grey-900 dark:text-white">
                    {displayName}
                </Text>
                {showDate && (
                    <>
                        <span aria-hidden="true"> · </span>
                        <time
                            dateTime={dateTime}
                            title={formattedDate}
                            className="text-grey-600 max-md:inline md:opacity-0 md:transition-opacity md:group-hover/reply:opacity-100"
                        >
                            {formattedDate}
                        </time>
                    </>
                )}
                {suffix && (
                    <>
                        <span aria-hidden="true"> · </span>
                        <Text as="span" className="text-grey-600">
                            {suffix}
                        </Text>
                    </>
                )}
            </>
        );

    return (
        <div className="flex min-w-0 items-baseline text-grey-800 dark:text-grey-100">{line}</div>
    );
}

export function MessageBody({body, className}: {body: string; className?: string}) {
    return (
        <Text
            as="p"
            className={`whitespace-pre-wrap text-grey-900 dark:text-white ${className ?? "mt-2"}`}
        >
            {body}
        </Text>
    );
}
