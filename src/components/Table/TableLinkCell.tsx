import type {ReactNode} from "react";

import type {LinkProps} from "react-router";

import {linkClassGenerator} from "@uva-fnwi/datanose-ui";

import {VersionedLink} from "~/components/VersionedLink";

type TableLinkCellProps = {
    to: string;
    children: ReactNode;
    state?: LinkProps["state"];
};

export function TableLinkCell({to, children, state}: TableLinkCellProps) {
    return (
        <VersionedLink
            to={to}
            state={state}
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
