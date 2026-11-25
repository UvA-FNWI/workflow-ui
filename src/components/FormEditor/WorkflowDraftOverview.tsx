import {type ReactNode, useState} from "react";

import {Button, cn, Heading, Icon} from "@uva-fnwi/datanose-ui";

import {WorkflowDraftStepDetails} from "~/components/FormEditor/WorkflowDraftStepDetails";
import {useTranslate} from "~/hooks/useTranslate";
import type {
    DraftFormReference,
    DraftStepReference,
    WorkflowDraftWorkspace,
} from "~/store/api/workflowDraftsApi";

export interface DraftLocation {
    section?: "forms" | "screens";
    step?: string;
    form?: string;
}

function flattenSteps(steps: DraftStepReference[]): DraftStepReference[] {
    return steps.flatMap((step) => [step, ...flattenSteps(step.children)]);
}

export function WorkflowDraftOverview({
    workspace,
    location,
    form,
    onNavigate,
    disabled,
    formActions,
    children,
}: {
    workspace: WorkflowDraftWorkspace;
    location: DraftLocation;
    form: DraftFormReference | undefined;
    onNavigate: (location: DraftLocation) => void;
    disabled: boolean;
    formActions: ReactNode;
    children: ReactNode;
}) {
    const {t, l} = useTranslate("form_editor");
    const [collapsed, setCollapsed] = useState(new Set<string>());
    const steps = flattenSteps(workspace.steps);
    const stepByName = new Map(steps.map((step) => [step.name, step]));
    const workflowForms = workspace.forms.filter(
        (item) => !item.steps.some(({name}) => stepByName.has(name)),
    );
    const formStep =
        form && steps.find(({name}) => form.steps.some((usage) => usage.name === name));
    const screens = location.section === "screens";
    const showWorkflowForms = location.section === "forms" && workflowForms.length > 0 && !formStep;
    const selectedStep =
        screens || showWorkflowForms
            ? undefined
            : (steps.find(({name}) => name === location.step) ?? (form ? formStep : steps[0]));
    const listLocation: DraftLocation = selectedStep
        ? {step: selectedStep.name}
        : {section: screens ? "screens" : "forms"};
    const title = selectedStep
        ? l(selectedStep.title) || selectedStep.name
        : t(screens ? "authoring_screens" : "authoring_workflow_forms");
    const forms = selectedStep
        ? workspace.forms.filter((item) => item.steps.some(({name}) => name === selectedStep.name))
        : workflowForms;
    const substeps = selectedStep?.children ?? [];
    const formLabel = (item: DraftFormReference) =>
        l(item.title) || item.title.en || item.title.nl || item.name;

    const navButton = (label: string, target: DraftLocation, active: boolean) => (
        <button
            type="button"
            aria-current={active ? "location" : undefined}
            disabled={disabled}
            onClick={() => onNavigate(target)}
            className={cn(
                "min-w-0 flex-1 rounded-xs border-s-4 py-2 ps-2 pe-2.5 text-left text-sm break-words focus-visible:ring-2 focus-visible:ring-navy-600 focus-visible:outline-none disabled:opacity-50 motion-safe:transition-colors dark:focus-visible:ring-sky-400",
                active
                    ? "border-s-navy-600 bg-navy-100 font-semibold text-navy-900 dark:border-s-sky-400 dark:bg-navy-900 dark:text-sky-100"
                    : "border-s-transparent hover:bg-navy-100 hover:text-navy-900 dark:hover:bg-grey-700 dark:hover:text-sky-100",
            )}
        >
            {label}
        </button>
    );

    const stepNavigation = (items: DraftStepReference[], nested = false) => (
        <ul
            className={cn(
                "space-y-0.5",
                nested && "ms-3 border-s border-grey-400 ps-2 dark:border-grey-700",
            )}
        >
            {items.map((step) => {
                const expanded = !collapsed.has(step.name);
                const label = l(step.title) || step.name;
                return (
                    <li key={step.name}>
                        <div className="flex items-center">
                            {navButton(label, {step: step.name}, step.name === selectedStep?.name)}
                            {step.children.length > 0 && (
                                <Button
                                    intent="ghost"
                                    size="square"
                                    aria-expanded={expanded}
                                    aria-label={t("authoring_toggle_substeps", {title: label})}
                                    disabled={disabled}
                                    onClick={() =>
                                        setCollapsed((previous) => {
                                            const next = new Set(previous);
                                            if (next.has(step.name)) next.delete(step.name);
                                            else next.add(step.name);
                                            return next;
                                        })
                                    }
                                >
                                    <Icon
                                        name={expanded ? "chevron-down-line" : "chevron-right-line"}
                                        size="sm"
                                        decorative
                                    />
                                </Button>
                            )}
                        </div>
                        {expanded &&
                            step.children.length > 0 &&
                            stepNavigation(step.children, true)}
                    </li>
                );
            })}
        </ul>
    );

    const formContext = (item: DraftFormReference) => {
        const otherSteps = item.steps
            .filter(({name}) => name !== selectedStep?.name)
            .map(({name}) => stepByName.get(name))
            .filter((step) => step !== undefined)
            .map((step) => l(step.title) || step.name);
        if (otherSteps.length === 0) return null;
        return t("authoring_also_used_in", {
            steps: otherSteps.join(", "),
        });
    };
    const currentFormContext = form && formContext(form);

    return (
        <div className="grid gap-5 border-t border-grey-300 pt-4 lg:grid-cols-[13rem_minmax(0,1fr)] lg:gap-6 dark:border-grey-700">
            <nav
                aria-label={t("authoring_workflow_overview")}
                className="self-start rounded-sm border border-grey-300 bg-grey-100 p-2 text-grey-900 dark:border-grey-700 dark:bg-grey-900 dark:text-grey-100"
            >
                {workspace.steps.length > 0 && (
                    <>
                        <p className="mb-1 px-3 pt-1 text-sm font-semibold text-grey-700 dark:text-grey-300">
                            {t("authoring_steps")}
                        </p>
                        {stepNavigation(workspace.steps)}
                    </>
                )}
                <ul
                    className={cn(
                        "space-y-0.5",
                        workspace.steps.length > 0 &&
                            "mt-2 border-t border-grey-300 pt-2 dark:border-grey-700",
                    )}
                >
                    {workflowForms.length > 0 && (
                        <li className="flex">
                            {navButton(
                                t("authoring_workflow_forms"),
                                {section: "forms"},
                                !selectedStep && !screens,
                            )}
                        </li>
                    )}
                    <li className="flex">
                        {navButton(t("authoring_screens"), {section: "screens"}, screens)}
                    </li>
                </ul>
            </nav>
            <section className="min-w-0">
                {form ? (
                    <div className="mb-4 space-y-3">
                        <Button
                            intent="ghost"
                            size="small"
                            leftIcon={<Icon name="arrow-left-line" size="sm" decorative />}
                            onClick={() => onNavigate(listLocation)}
                            disabled={disabled}
                        >
                            {t("authoring_back_to_section", {title})}
                        </Button>
                        <div className="flex flex-wrap items-center justify-between gap-2">
                            <Heading as="h3" size="sm">
                                {formLabel(form)}
                            </Heading>
                            {formActions}
                        </div>
                        {currentFormContext && (
                            <p className="text-sm text-grey-700 dark:text-grey-300">
                                {currentFormContext}
                            </p>
                        )}
                    </div>
                ) : (
                    <>
                        <Heading as="h3" size="sm">
                            {title}
                        </Heading>
                        {screens ? (
                            <p className="mt-2 text-sm text-grey-700 dark:text-grey-300">
                                {t("authoring_screens_placeholder")}
                            </p>
                        ) : (
                            <>
                                {selectedStep && (forms.length > 0 || substeps.length === 0) && (
                                    <p className="mt-2 mb-1 text-sm font-semibold">
                                        {t("authoring_forms")}
                                    </p>
                                )}
                                {forms.length > 0 ? (
                                    <ul className="mt-2 divide-y divide-grey-300 rounded-sm border border-grey-300 dark:divide-grey-700 dark:border-grey-700">
                                        {forms.map((item) => {
                                            const label = formLabel(item);
                                            const actions =
                                                forms.length > 1
                                                    ? item.steps
                                                          .find(
                                                              ({name}) =>
                                                                  name === selectedStep?.name,
                                                          )
                                                          ?.actionLabels.map((action) => l(action))
                                                          .filter(
                                                              (action) =>
                                                                  action && action !== label,
                                                          )
                                                    : undefined;
                                            const context = formContext(item);
                                            return (
                                                <li key={item.path}>
                                                    <button
                                                        type="button"
                                                        disabled={disabled}
                                                        onClick={() =>
                                                            onNavigate({
                                                                ...listLocation,
                                                                form: item.path,
                                                            })
                                                        }
                                                        className="flex w-full items-center justify-between gap-3 rounded-xs px-3 py-2.5 text-left hover:bg-navy-100 focus-visible:ring-2 focus-visible:ring-navy-600 focus-visible:outline-none disabled:opacity-50 motion-safe:transition-colors dark:hover:bg-grey-700 dark:focus-visible:ring-sky-400"
                                                    >
                                                        <span className="min-w-0">
                                                            <span className="block font-medium">
                                                                {label}
                                                            </span>
                                                            {actions?.length ? (
                                                                <span className="block text-sm text-grey-700 dark:text-grey-300">
                                                                    {[...new Set(actions)].join(
                                                                        ", ",
                                                                    )}
                                                                </span>
                                                            ) : null}
                                                            {context && (
                                                                <span className="block text-sm text-grey-700 dark:text-grey-300">
                                                                    {context}
                                                                </span>
                                                            )}
                                                        </span>
                                                        <Icon
                                                            name="chevron-right-line"
                                                            size="sm"
                                                            color="current"
                                                            className="shrink-0 text-navy-700 dark:text-sky-300"
                                                            decorative
                                                        />
                                                    </button>
                                                </li>
                                            );
                                        })}
                                    </ul>
                                ) : substeps.length === 0 ? (
                                    <p className="mt-2 text-sm text-grey-700 dark:text-grey-300">
                                        {t(
                                            selectedStep
                                                ? "authoring_no_step_forms"
                                                : "authoring_no_forms",
                                        )}
                                    </p>
                                ) : null}
                                {substeps.length > 0 && (
                                    <div className="mt-4">
                                        <Heading as="h4" size="xs">
                                            {t("authoring_substeps")}
                                        </Heading>
                                        <ul className="mt-1 divide-y divide-grey-300 dark:divide-grey-700">
                                            {substeps.map((step) => (
                                                <li className="flex" key={step.name}>
                                                    {navButton(
                                                        l(step.title) || step.name,
                                                        {step: step.name},
                                                        false,
                                                    )}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                )}
                                {selectedStep && (
                                    <WorkflowDraftStepDetails
                                        step={selectedStep}
                                        forms={workspace.forms}
                                    />
                                )}
                            </>
                        )}
                    </>
                )}
                {children}
            </section>
        </div>
    );
}
