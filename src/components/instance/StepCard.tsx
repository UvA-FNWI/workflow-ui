import {useState} from "react";

import {Disclosure, Heading, Pill, type PillVariantProps, Text} from "@uva-fnwi/datanose-ui";
import i18n from "i18next";

import {
    getStepHierarchy,
    hasVersionHistory,
    resolveContentState,
    resolveModalState,
} from "~/components/instance/resolveContentState.ts";
import {StepCardBody} from "~/components/instance/StepCardBody.tsx";
import {useTranslate} from "~/hooks/useTranslate.ts";
import type {
    Action,
    StepHeaderStatus,
    WorkflowInstance,
    WorkflowStep,
} from "~/store/api/types/instances.ts";
import {formatDateShort} from "~/utils/formatDate.ts";

const HEADER_STATUS_VARIANT: Record<StepHeaderStatus["type"], PillVariantProps["variant"]> = {
    Info: "grey",
    Attention: "orange",
    Success: "green",
};

function mapHeaderStatusType(type: StepHeaderStatus["type"]): PillVariantProps["variant"] {
    return HEADER_STATUS_VARIANT[type];
}

type Props = {
    step: WorkflowStep;
    instance: WorkflowInstance;
};

const shouldAutoOpenForm = (
    action: Action,
    submissions: {dateSubmitted?: string; form: {name: string}}[],
) =>
    action.type === "SubmitForm" &&
    action.autoOpenForm !== false &&
    !submissions.some((s) => s.dateSubmitted && s.form.name === action.form);

export const StepCard = ({step, instance}: Props) => {
    const {t, l} = useTranslate("workflow");

    const stepHierarchy = getStepHierarchy(step);
    const stepIds = stepHierarchy.map((s) => s.id);
    const actions = instance.actions.filter((action) =>
        action.steps.some((actionStepId) => stepIds.includes(actionStepId)),
    );
    const submissions = instance.submissions.filter((s) => stepIds.includes(s.form.step ?? ""));

    const autoOpenAction =
        actions.length === 1 && actions[0] && shouldAutoOpenForm(actions[0], submissions)
            ? actions[0]
            : null;

    const [activeAction, setActiveAction] = useState<Action | null>(autoOpenAction);

    const resolvedAction = activeAction ?? autoOpenAction;

    const isCurrentStep = stepIds.includes(instance.currentStep ?? "");
    const currentStepIndex = instance.steps.findIndex((s) =>
        [s.id, ...(s.children?.map((c) => c.id) ?? [])].includes(instance.currentStep ?? ""),
    );

    const deadlineDate =
        step.deadline ?? step.children?.find((c) => c.id == instance.currentStep)?.deadline ?? null;
    const submittedDate =
        [step.dateCompleted, ...(step.children?.map((child) => child.dateCompleted) ?? [])]
            .filter((date): date is string => Boolean(date))
            .sort((a, b) => new Date(b).getTime() - new Date(a).getTime())[0] ?? null;
    const shownDate = submittedDate
        ? {label: t("status.submitted"), value: submittedDate}
        : deadlineDate
          ? {label: t("progress.deadline"), value: deadlineDate}
          : null;

    const isDisabled =
        !!instance.currentStep && !isCurrentStep && instance.steps.indexOf(step) > currentStepIndex;

    const contentState = resolveContentState(step, submissions);
    const modalState = resolveModalState(activeAction);
    const hasVisibleSubmission =
        submissions.length > 0 || stepHierarchy.some((candidate) => hasVersionHistory(candidate));
    const isFormOpen =
        resolvedAction?.type === "SubmitForm" && resolvedAction.formLayout !== "Modal";
    const emptyStateMessage =
        !isFormOpen &&
        !hasVisibleSubmission &&
        stepHierarchy.some(({hasSubmission}) => hasSubmission)
            ? t("instance.unauthorized_submission")
            : !isFormOpen && stepHierarchy.some(({expectsSubmission}) => expectsSubmission)
              ? t("instance.empty_step")
              : null;
    const hasBodyContent =
        actions.length > 0 ||
        submissions.length > 0 ||
        hasVersionHistory(step) ||
        step.resultsType !== "Normal" ||
        emptyStateMessage !== null;
    const isContentless = !isDisabled && !hasBodyContent;

    return (
        <Disclosure
            defaultExpanded={isCurrentStep && hasBodyContent}
            isDisabled={isDisabled || !hasBodyContent}
            className={isContentless ? "cursor-default! opacity-100!" : undefined}
        >
            <Disclosure.Header
                showChevron={hasBodyContent}
                className={isContentless ? "cursor-default!" : undefined}
            >
                <div className="flex w-full flex-col items-start gap-2 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex min-w-0 flex-wrap items-center gap-2">
                        <Heading className="font-semibold">{l(step.title)}</Heading>
                        {/* If we don't have a header status, we can show the date completed */}
                        {step.dateCompleted && !step.headerStatus && (
                            <Pill variant="green">
                                {t("status.completed_on")}{" "}
                                {formatDateShort(step.dateCompleted, i18n.language)}
                            </Pill>
                        )}
                        {step.headerStatus && (
                            <Pill variant={mapHeaderStatusType(step.headerStatus.type)}>
                                {l(step.headerStatus.label)}
                            </Pill>
                        )}
                    </div>
                    {shownDate && (
                        <Text as="span" className="shrink-0">
                            <Text fontWeight="semibold">{shownDate.label}</Text>
                            {":\t"}
                            {formatDateShort(shownDate.value, i18n.language)}
                        </Text>
                    )}
                </div>
            </Disclosure.Header>
            {hasBodyContent && (
                <Disclosure.Content>
                    <StepCardBody
                        step={step}
                        instance={instance}
                        actions={actions}
                        submissions={submissions}
                        contentState={contentState}
                        modalState={modalState}
                        activeAction={activeAction}
                        resolvedAction={resolvedAction}
                        emptyStateMessage={emptyStateMessage}
                        setActiveAction={setActiveAction}
                    />
                </Disclosure.Content>
            )}
        </Disclosure>
    );
};
