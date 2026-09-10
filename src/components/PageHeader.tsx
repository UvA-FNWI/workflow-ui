import {type ReactNode} from "react";

import {Heading, Skeleton} from "@uva-fnwi/datanose-ui";

import {type BreadcrumbItem, Breadcrumbs} from "~/components/Breadcrumbs";

interface PageHeaderProps {
    title: ReactNode;
    crumbs?: BreadcrumbItem[];
    backLabel?: ReactNode;
    backTo?: string;
    description?: ReactNode;
    actions?: ReactNode;
    isLoading?: boolean;
}

export function PageHeader({
    title,
    crumbs,
    backLabel,
    backTo,
    description,
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

    const items = crumbs ?? (backLabel != null ? [{to: backTo ?? "/", label: backLabel}] : []);

    return (
        <div className="mb-8 flex flex-col gap-2">
            <Breadcrumbs items={items} />
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
