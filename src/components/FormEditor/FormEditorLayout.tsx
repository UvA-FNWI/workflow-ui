import type {ReactNode} from "react";

import {cn} from "@uva-fnwi/datanose-ui";

import {useTranslate} from "~/hooks/useTranslate";

export function FormEditorLayout({sidebar, children}: {sidebar: ReactNode; children: ReactNode}) {
    const {t} = useTranslate("form_editor");
    return (
        <div className="grid gap-6 md:grid-cols-[13rem_1fr]">
            <nav
                aria-label={t("pages")}
                className="md:border-r md:border-grey-300 md:pr-4 md:dark:border-grey-700"
            >
                {sidebar}
            </nav>
            <div className="min-w-0">{children}</div>
        </div>
    );
}

export function FormEditorPageButton({
    active,
    onClick,
    children,
}: {
    active: boolean;
    onClick: () => void;
    children: ReactNode;
}) {
    return (
        <button
            type="button"
            aria-current={active}
            onClick={onClick}
            className={cn(
                "w-full rounded-xs border-s-4 py-1.5 ps-2 pe-2 text-left text-sm whitespace-nowrap focus-visible:ring-2 focus-visible:ring-navy-600 focus-visible:outline-none motion-safe:transition-colors dark:focus-visible:ring-sky-400",
                active
                    ? "border-s-navy-600 bg-navy-100 font-semibold text-navy-900 dark:border-s-sky-400 dark:bg-navy-900 dark:text-sky-100"
                    : "border-s-transparent hover:bg-navy-100 hover:text-navy-900 dark:hover:bg-grey-700 dark:hover:text-sky-100",
            )}
        >
            {children}
        </button>
    );
}
