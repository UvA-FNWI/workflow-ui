import {type ReactNode} from "react";

import {Icon} from "@uva-fnwi/datanose-ui";

import {VersionedLink} from "~/components/VersionedLink";

interface BackLinkProps {
    /** Destination route. Defaults to the root route. */
    to?: string;
    /** Link text. */
    children: ReactNode;
    /** Extra classes appended to the link. */
    className?: string;
}

/**
 * A back-navigation link: a left arrow followed by a label, styled in the brand colour.
 * Preserves the selected workflow version via {@link VersionedLink}.
 */
export function BackLink({to = "/", children, className}: BackLinkProps) {
    return (
        <VersionedLink
            to={to}
            className={`inline-flex items-center text-sm text-red-brand hover:opacity-80${
                className ? ` ${className}` : ""
            }`}
        >
            <Icon name="arrow-left-line" size="xs" className="mr-1" color="current" />
            {children}
        </VersionedLink>
    );
}
