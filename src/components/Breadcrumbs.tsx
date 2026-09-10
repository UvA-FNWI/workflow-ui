import {type ReactNode} from "react";

import {Icon} from "@uva-fnwi/datanose-ui";

import {VersionedLink} from "~/components/VersionedLink";

export type BreadcrumbItem = {
    to: string;
    label: ReactNode;
};

type Props = {
    items: BreadcrumbItem[];
};

export function Breadcrumbs({items}: Props) {
    if (items.length === 0) return null;

    return (
        <nav aria-label="Breadcrumb">
            <ol className="flex flex-wrap items-center gap-1">
                {items.map((item, index) => (
                    <li key={`${item.to}-${index}`} className="flex items-center gap-1">
                        {index > 0 && (
                            <Icon
                                name="chevron-right-line"
                                size="xs"
                                decorative
                                className="text-grey-400"
                            />
                        )}
                        <VersionedLink
                            to={item.to}
                            className="text-sm text-red-brand hover:opacity-80"
                        >
                            {item.label}
                        </VersionedLink>
                    </li>
                ))}
            </ol>
        </nav>
    );
}
