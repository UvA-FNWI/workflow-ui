import {Heading, Pill} from "@uva-fnwi/datanose-ui";

import {useTranslate} from "~/hooks/useTranslate";
import type {
    DraftCompletionRule,
    DraftFormReference,
    DraftStepReference,
} from "~/store/api/workflowDraftsApi";

function CompletionRule({rule}: {rule: DraftCompletionRule}) {
    const {t, l} = useTranslate("form_editor");
    const label = l(rule.label) || rule.label?.en || rule.label?.nl || "";
    const operand = rule.operand?.startsWith("=") ? rule.operand.slice(1) : rule.operand;
    const key = rule.kind === "value" && rule.operator ? rule.operator : rule.kind;
    return (
        <div>
            {rule.negated && (
                <Pill variant="grey" className="me-1">
                    {t("authoring_rule_negated")}
                </Pill>
            )}
            <span>{t(`authoring_rule.${key}`, {label, operand})}</span>
            {rule.children.length > 0 && (
                <ul className="ms-2 mt-1 space-y-1 border-s border-grey-300 ps-3 dark:border-grey-700">
                    {rule.children.map((child, index) => (
                        <li key={index}>
                            <CompletionRule rule={child} />
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}

export function WorkflowDraftStepDetails({
    step,
    forms,
}: {
    step: DraftStepReference;
    forms: DraftFormReference[];
}) {
    const {t, l} = useTranslate("form_editor");
    const editableForms = new Map(forms.map((form) => [form.name, form.title]));
    return (
        <div className="mt-5 grid gap-4 border-t border-grey-300 pt-4 md:grid-cols-[minmax(0,3fr)_minmax(0,2fr)] dark:border-grey-700">
            <section>
                <Heading as="h4" size="xs">
                    {t("authoring_step_actions")}
                </Heading>
                {step.actions?.length ? (
                    <ul className="mt-2 divide-y divide-grey-200 rounded-sm border border-grey-300 dark:divide-grey-700 dark:border-grey-700">
                        {step.actions.map((action, index) => {
                            const actionType = t(`authoring_action_type.${action.type}`, {
                                defaultValue: action.type.replace(/([a-z])([A-Z])/g, "$1 $2"),
                            });
                            const roles = action.roles.map((role) => l(role) || role.en || role.nl);
                            const targets = action.allForms
                                ? t("authoring_action_any_form")
                                : action.forms
                                      .map(({name, title}) => {
                                          const target = editableForms.get(name) ?? title;
                                          return l(target) || target.en || target.nl || name;
                                      })
                                      .join(", ");
                            return (
                                <li key={index} className="space-y-1 px-3 py-2">
                                    <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                                        <p className="font-medium">
                                            {l(action.label) ||
                                                action.label?.en ||
                                                action.label?.nl ||
                                                actionType}
                                        </p>
                                        {action.conditional && (
                                            <Pill variant="grey">
                                                {t("authoring_action_conditional")}
                                            </Pill>
                                        )}
                                    </div>
                                    <p className="text-sm text-grey-700 dark:text-grey-300">
                                        {roles.length > 0
                                            ? roles.join(", ")
                                            : t("authoring_action_no_roles")}
                                        {targets && <span> · {targets}</span>}
                                    </p>
                                </li>
                            );
                        })}
                    </ul>
                ) : (
                    <p className="mt-2 text-sm text-grey-700 dark:text-grey-300">
                        {t("authoring_no_step_actions")}
                    </p>
                )}
            </section>
            <section>
                <Heading as="h4" size="xs">
                    {t("authoring_step_completion")}
                </Heading>
                <div className="mt-2 rounded-sm border border-grey-300 bg-grey-100 p-3 text-sm dark:border-grey-700 dark:bg-grey-900">
                    {step.completion ? (
                        <CompletionRule rule={step.completion} />
                    ) : (
                        t("authoring_no_step_completion")
                    )}
                </div>
            </section>
        </div>
    );
}
