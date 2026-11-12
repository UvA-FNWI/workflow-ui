import type {PropsWithChildren} from "react";

import {Card} from "@uva-fnwi/datanose-ui";

export function HomeList({children}: PropsWithChildren) {
    return (
        <Card padding="none">
            <ul className="divide-y-2 divide-grey-200 dark:divide-grey-700">{children}</ul>
        </Card>
    );
}
