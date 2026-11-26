import type {ReactNode} from "react";

import {cn, Text} from "@uva-fnwi/datanose-ui";

export function TableTextCell({children, className}: {children: ReactNode; className?: string}) {
    return (
        <Text display="block" size="sm" truncate className={cn("max-w-80", className)}>
            {children}
        </Text>
    );
}
