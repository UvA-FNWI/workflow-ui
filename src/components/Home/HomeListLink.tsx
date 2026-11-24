import type {ReactNode} from "react";

import type {LinkProps} from "react-router";

import {cn, Icon, Text} from "@uva-fnwi/datanose-ui";

import {VersionedLink} from "~/components/VersionedLink";

type HomeListLinkProps = Pick<LinkProps, "to" | "state"> & {
    title: string;
    subtitle?: string;
    icon: ReactNode;
    iconClassName?: string;
};

export function HomeListLink({to, state, title, subtitle, icon, iconClassName}: HomeListLinkProps) {
    return (
        <VersionedLink
            to={to}
            state={state}
            className="group hover:bg-grey-50 flex items-center gap-4 px-5 py-3 text-grey-900 transition-colors focus-visible:outline focus-visible:-outline-offset-2 dark:text-grey-100 dark:hover:bg-grey-700"
        >
            <div
                className={cn(
                    "flex size-11 shrink-0 items-center justify-center rounded-full",
                    iconClassName,
                )}
            >
                {icon}
            </div>
            <span className="flex min-w-0 flex-1 flex-col">
                <Text as="span" fontWeight="semibold" className="wrap-break-word">
                    {title}
                </Text>
                {subtitle && (
                    <Text
                        as="span"
                        size="sm"
                        className="wrap-break-word text-grey-600 dark:text-grey-300"
                    >
                        {subtitle}
                    </Text>
                )}
            </span>
            <Icon
                name="chevron-right-line"
                color="current"
                className="shrink-0 text-grey-400 transition group-hover:text-current group-focus-visible:text-current motion-safe:group-hover:translate-x-1"
                decorative
            />
        </VersionedLink>
    );
}
