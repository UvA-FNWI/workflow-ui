import {type ReactNode} from "react";

import {Heading, Skeleton} from "@uva-fnwi/datanose-ui";

import {BackLink} from "~/components/BackLink";

interface PageHeaderProps {
    title: ReactNode;
    backLabel: ReactNode;
    backTo?: string;
    actions?: ReactNode;
    isLoading?: boolean;
}

export function PageHeader({
    title,
    backLabel,
    backTo,
    actions,
    isLoading = false,
}: PageHeaderProps) {
    if (isLoading) {
        return (
            <div className="mb-8 flex flex-col gap-2">
                <Skeleton className="h-4 w-24" />
                <div className="flex items-center justify-between gap-4">
                    <Skeleton className="h-8 w-48" />
                    {actions && <Skeleton className="h-10 w-28" />}
                </div>
            </div>
        );
    }

    return (
        <div className="mb-8 flex flex-col gap-2">
            <BackLink to={backTo}>{backLabel}</BackLink>
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <Heading as="h1" size="lg">
                    {title}
                </Heading>
                {actions}
            </div>
        </div>
    );
}
