import {type ReactNode} from "react";

import {cn, Heading, Skeleton} from "@uva-fnwi/datanose-ui";

import {BackLink} from "~/components/BackLink";

interface PageHeaderProps {
    title: ReactNode;
    backLabel?: ReactNode;
    backTo?: string;
    description?: ReactNode;
    actions?: ReactNode;
    isLoading?: boolean;
    className?: string;
}

export function PageHeader({
    title,
    backLabel,
    backTo,
    description,
    actions,
    isLoading = false,
    className,
}: PageHeaderProps) {
    if (isLoading) {
        return (
            <div className={cn("mb-8 flex flex-col gap-2", className)} aria-busy="true">
                <div className="my-3 h-2" />
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex min-w-0 flex-col gap-1">
                        <div className="h-4 w-48 max-w-full" />
                        {description && <div className="h-5 w-64 max-w-full" />}
                    </div>
                    {actions && (
                        <Skeleton className="h-10 w-28 shrink-0 bg-grey-400! dark:bg-grey-700!" />
                    )}
                </div>
            </div>
        );
    }

    return (
        <div className={cn("mb-8 flex flex-col gap-2", className)}>
            {backLabel ? (
                <BackLink to={backTo}>{backLabel}</BackLink>
            ) : (
                <div className="min-h-[20px]" />
            )}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex flex-col gap-1">
                    <Heading as="h1" size="lg">
                        {title}
                    </Heading>
                    {description}
                </div>
                {actions}
            </div>
        </div>
    );
}
