import type {ReactNode} from "react";

import {linkClassGenerator} from "@uva-fnwi/datanose-ui";

import {VersionedLink} from "~/components/VersionedLink";

type TableLinkCellProps = {
    to: string;
    children: ReactNode;
};

export function TableLinkCell({to, children}: TableLinkCellProps) {
    return (
        <VersionedLink
            to={to}
            className={linkClassGenerator({
                intent: "primary",
                underline: true,
                size: "sm",
            })}
        >
            {children}
        </VersionedLink>
    );
}
