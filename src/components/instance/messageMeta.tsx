import {Text} from "@uva-fnwi/datanose-ui";

import {formatDate} from "~/utils/formatDate";

export function MessageMeta({
    displayName,
    dateTime,
    language,
    suffix,
    truncate = true,
}: {
    displayName: string;
    dateTime: string;
    language: string;
    suffix?: string;
    truncate?: boolean;
}) {
    const formattedDate = formatDate(dateTime, language);

    return (
        <div
            className={`ui:text-base min-w-0 text-grey-800 dark:text-grey-100 ${truncate ? "truncate" : "wrap-anywhere"}`}
        >
            <Text
                as="span"
                display="inline"
                fontWeight="semibold"
                className="text-grey-900 dark:text-white"
            >
                {displayName}
            </Text>{" "}
            <span className="inline-block max-w-full">
                <span aria-hidden="true">{"·\u00a0"}</span>
                <time dateTime={dateTime} title={formattedDate} className="text-grey-600">
                    {formattedDate}
                </time>
            </span>
            {suffix && (
                <>
                    <span aria-hidden="true"> · </span>
                    <Text as="span" display="inline" className="text-grey-600">
                        {suffix}
                    </Text>
                </>
            )}
        </div>
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
