import type {ReactNode} from "react";

import {Text} from "@uva-fnwi/datanose-ui";

export function TableTextCell({children}: {children: ReactNode}) {
    return (
        <Text display="block" size="sm" truncate className="max-w-80">
            {children}
        </Text>
    );
}
