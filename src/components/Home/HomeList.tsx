import type {PropsWithChildren} from "react";

import {Card} from "@uva-fnwi/datanose-ui";

export function HomeList({children, label}: PropsWithChildren<{label?: string}>) {
    return (
        <Card padding="none">
            <ul aria-label={label} className="divide-y-2 divide-grey-200 dark:divide-grey-700">
                {children}
            </ul>
        </Card>
    );
}
