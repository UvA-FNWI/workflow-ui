import {Link, type LinkProps} from "react-router";

import {useVersionSuffix} from "~/hooks/useVersionedNavigate";

/**
 * A <Link> that preserves the selected workflow version (?version=) when given a string `to`.
 * Non-string `to` values are passed through unchanged.
 */
export function VersionedLink({to, ...props}: LinkProps) {
    const suffix = useVersionSuffix();
    return <Link to={typeof to === "string" ? `${to}${suffix}` : to} {...props} />;
}
