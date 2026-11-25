import type {ReactNode} from "react";

import {Icon} from "@uva-fnwi/datanose-ui";

import {useTranslate} from "~/hooks/useTranslate";

export function FormElementCard({
    title,
    expanded,
    onToggle,
    dragHandle,
    actions,
    preview,
    children,
}: {
    title: ReactNode;
    expanded: boolean;
    onToggle: () => void;
    dragHandle?: ReactNode;
    actions: ReactNode;
    preview: ReactNode;
    children: ReactNode;
}) {
    return (
        <div className="rounded-xs border border-grey-300 bg-white dark:border-grey-600 dark:bg-grey-900">
            <div className="flex items-center gap-2 p-2">
                {dragHandle && <div className="shrink-0 text-grey-500">{dragHandle}</div>}
                <button
                    type="button"
                    onClick={onToggle}
                    aria-expanded={expanded}
                    className="flex min-w-0 items-center gap-2 rounded-xs px-1 py-1 text-left focus-visible:ring-2 focus-visible:ring-navy-600 focus-visible:outline-none"
                >
                    <Icon
                        name={expanded ? "chevron-down-line" : "chevron-right-line"}
                        size="sm"
                        className="shrink-0"
                        decorative
                    />
                    {title}
                </button>
                {actions}
            </div>
            {expanded && (
                <div className="grid gap-4 border-t border-grey-200 p-3 lg:grid-cols-[minmax(0,3fr)_minmax(0,2fr)] dark:border-grey-700">
                    <div className="min-w-0">{children}</div>
                    <div className="min-w-0 lg:sticky lg:top-4 lg:self-start">{preview}</div>
                </div>
            )}
        </div>
    );
}

export function FormElementPreview({children}: {children: ReactNode}) {
    const {t} = useTranslate("form_editor");
    return (
        <div className="rounded-xs border border-dashed border-grey-300 bg-grey-100 p-3 dark:border-grey-600 dark:bg-grey-800">
            <p className="mb-2 flex items-center gap-1 text-xs font-medium tracking-wide text-grey-700 uppercase dark:text-grey-300">
                <Icon name="visible-line" size="xs" decorative />
                {t("preview_label")}
            </p>
            {children}
        </div>
    );
}
