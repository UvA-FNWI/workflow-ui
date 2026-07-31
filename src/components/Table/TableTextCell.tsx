import type {ReactNode} from "react";

import {Text} from "@uva-fnwi/datanose-ui";

export function TableTextCell({children}: {children: ReactNode}) {
    return (
        <Text size="sm" truncate className="block max-w-80">
            {children}
        </Text>
    );
}
