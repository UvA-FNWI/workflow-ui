import {useState} from "react";

import {Disclosure, Heading, Pill, type PillVariantProps, Text} from "@uva-fnwi/datanose-ui";
import i18n from "i18next";

import {
    getStepHierarchy,
    hasVersionHistory,
    resolveContentState,
    resolveFormState,
    resolveModalState,
} from "~/components/instance/resolveContentState.ts";
import {StepCardBody} from "~/components/instance/StepCardBody.tsx";
import {MarkdownRenderer} from "~/components/MarkdownRenderer.tsx";
import {useTranslate} from "~/hooks/useTranslate.ts";
import type {
    Action,
    StepHeaderStatus,
    WorkflowInstance,
    WorkflowStep,
} from "~/store/api/types/instances.ts";
import type {Submission} from "~/store/api/types/submissions.ts";
import {formatDateShort, formatDateShortWithRelevantTime} from "~/utils/formatDate.ts";

const HEADER_STATUS_VARIANT: Record<StepHeaderStatus["type"], PillVariantProps["variant"]> = {
    Info: "grey",
    Attention: "orange",
    Success: "green",
    Error: "red",
};

type Props = {
    step: WorkflowStep;
    instance: WorkflowInstance;
    nested?: boolean;
    rootStep?: WorkflowStep;
};

export const StepCard = ({step, instance, nested = false, rootStep = step}: Props) => {
    const {t, l} = useTranslate("workflow");

    const childRows =
        !nested && step.childrenLayout === "CollapsibleRows" ? (step.children ?? []) : [];
    const showChildRows = childRows.length > 0;

    // Child rows own their content; combined cards include the whole hierarchy.
    const fullHierarchy = getStepHierarchy(step);
    const contentStep = showChildRows ? getParentContent(step) : step;
    const contentSteps = showChildRows ? [contentStep] : fullHierarchy;
    const allStepIds = new Set(fullHierarchy.map((candidate) => candidate.id));
    const contentStepIds = showChildRows ? new Set([step.id]) : allStepIds;
    const actions = instance.actions.filter((action) =>
        action.steps.some((actionStepId) => contentStepIds.has(actionStepId)),
    );
    const submissions = instance.submissions.filter((s) => contentStepIds.has(s.form.step ?? ""));

    const deadlineMessages = contentSteps.filter(
        (candidate) =>
            candidate.deadline?.message != null ||
            (candidate.deadline?.type === "Hard" && candidate.deadline.isPassed),
    );

    // Availability includes child actions even when they render in separate rows.
    const isCurrentStep = allStepIds.has(instance.currentStep ?? "");
    const currentStepIndex = instance.steps.findIndex((s) =>
        [s.id, ...(s.children?.map((c) => c.id) ?? [])].includes(instance.currentStep ?? ""),
    );
    const isAfterCurrentStep = instance.steps.indexOf(rootStep) > currentStepIndex;

    // An unfinished alongside obligation can move the current step backward. Steps that are
    // already completed or still have available actions must remain usable regardless of order.
    const hasAvailableAction = instance.actions.some((action) =>
        action.steps.some((id) => allStepIds.has(id)),
    );
    const isUnavailableFutureStep =
        !step.dateCompleted &&
        deadlineMessages.length === 0 &&
        !hasAvailableAction &&
        !!instance.currentStep &&
        !isCurrentStep &&
        isAfterCurrentStep;

    const {activeAction, resolvedAction, setActiveAction} = useStepActions(actions, submissions);

    const hasVisibleSubmission = submissions.length > 0 || contentSteps.some(hasVersionHistory);
    let emptyStateMessage: string | null = null;
    if (!resolveFormState(resolvedAction)) {
        if (!hasVisibleSubmission && contentSteps.some((candidate) => candidate.hasSubmission)) {
            emptyStateMessage = t("instance.unauthorized_submission");
        } else if (contentSteps.some((candidate) => candidate.expectsSubmission)) {
            emptyStateMessage = t("instance.empty_step");
        }
    }

    const hasStepContent =
        actions.length > 0 ||
        submissions.length > 0 ||
        hasVersionHistory(contentStep) ||
        step.resultsType !== "Normal" ||
        emptyStateMessage !== null;
    const hasBodyContent = deadlineMessages.length > 0 || hasStepContent || childRows.length > 0;
    const isContentless = !isUnavailableFutureStep && !hasBodyContent;
    const [isExpanded, setIsExpanded] = useState(isCurrentStep && hasBodyContent);

    return (
        <Disclosure
            isExpanded={isExpanded}
            onExpandedChange={setIsExpanded}
            isDisabled={isUnavailableFutureStep || !hasBodyContent}
            shadow={nested ? "none" : undefined}
            border={nested ? "none" : undefined}
            className={
                nested
                    ? "rounded-none! border-b border-grey-300"
                    : isContentless
                      ? "cursor-default! opacity-100!"
                      : undefined
            }
        >
            <StepCardHeader
                step={step}
                nested={nested}
                hasBodyContent={hasBodyContent}
                isContentless={isContentless}
                submissions={submissions}
                currentStep={instance.currentStep}
                deadlinePassed={contentSteps.some((candidate) => candidate.deadline?.isPassed)}
            />
            {hasBodyContent && (
                <Disclosure.Content padding={nested ? "none" : undefined}>
                    {deadlineMessages.map((candidate) => (
                        <div key={candidate.id} className="pt-4">
                            <MarkdownRenderer>
                                {l(candidate.deadline?.message) || t("instance.deadline_passed")}
                            </MarkdownRenderer>
                        </div>
                    ))}
                    {/* Closed rows must not mount an automatically opened form. */}
                    {hasStepContent && (!nested || isExpanded) && (
                        <StepCardBody
                            step={contentStep}
                            instance={instance}
                            actions={actions}
                            submissions={submissions}
                            contentState={resolveContentState(contentStep, submissions)}
                            modalState={resolveModalState(activeAction)}
                            activeAction={activeAction}
                            resolvedAction={resolvedAction}
                            emptyStateMessage={emptyStateMessage}
                            setActiveAction={setActiveAction}
                        />
                    )}
                    {childRows.map((child) => (
                        <StepCard
                            key={child.id}
                            step={child}
                            instance={instance}
                            nested
                            rootStep={rootStep}
                        />
                    ))}
                </Disclosure.Content>
            )}
        </Disclosure>
    );
};

function useStepActions(actions: Action[], submissions: Submission[]) {
    const [onlyAction] = actions;
    const autoOpenAction =
        actions.length === 1 &&
        onlyAction?.type === "SubmitForm" &&
        onlyAction.autoOpenForm !== false &&
        !submissions.some((s) => s.dateSubmitted && s.form.name === onlyAction.form)
            ? onlyAction
            : null;
    const [selectedAction, setActiveAction] = useState<Action | null>(autoOpenAction);

    // A refresh can revoke an action while its form or modal is still open.
    const activeAction = actions.find((action) => action.id === selectedAction?.id) ?? null;
    return {activeAction, resolvedAction: activeAction ?? autoOpenAction, setActiveAction};
}

function getParentContent(step: WorkflowStep): WorkflowStep {
    return {
        ...step,
        versions:
            step.versions
                ?.map((version) => ({
                    ...version,
                    submissions: version.submissions.filter(
                        (submission) => submission.form.step === step.id,
                    ),
                }))
                .filter((version) => version.submissions.length > 0) ?? null,
    };
}

function latestDate(dates: (string | null | undefined)[]): string | null {
    return (
        dates
            .filter((date): date is string => Boolean(date))
            .sort((a, b) => new Date(b).getTime() - new Date(a).getTime())[0] ?? null
    );
}

function StepCardHeader({
    step,
    nested,
    hasBodyContent,
    isContentless,
    submissions,
    currentStep,
    deadlinePassed,
}: {
    step: WorkflowStep;
    nested: boolean;
    hasBodyContent: boolean;
    isContentless: boolean;
    submissions: Submission[];
    currentStep: WorkflowInstance["currentStep"];
    deadlinePassed: boolean;
}) {
    const {t, l} = useTranslate("workflow");

    const shownDate = getHeaderDate(step, submissions, nested, currentStep);

    return (
        <Disclosure.Header
            nested={nested}
            showChevron={hasBodyContent}
            className={isContentless ? "cursor-default!" : undefined}
        >
            <div className="flex w-full flex-col items-start gap-2 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex min-w-0 flex-wrap items-center gap-2">
                    <Heading as={nested ? "h4" : "h3"} className="font-semibold">
                        {l(step.title)}
                    </Heading>
                    {step.dateCompleted && !step.headerStatus && (
                        <Pill variant="green">
                            {t("status.completed_on")}{" "}
                            {formatDateShort(step.dateCompleted, i18n.language)}
                        </Pill>
                    )}
                    {step.headerStatus && (
                        <Pill variant={HEADER_STATUS_VARIANT[step.headerStatus.type]}>
                            {l(step.headerStatus.label) ||
                                (deadlinePassed ? t("status.deadline_passed") : null)}
                        </Pill>
                    )}
                </div>
                {shownDate && (
                    <Text as="span" className="shrink-0">
                        <Text fontWeight="semibold">
                            {shownDate.submitted ? t("status.submitted") : t("progress.deadline")}
                        </Text>
                        {":\t"}
                        {shownDate.submitted
                            ? formatDateShort(shownDate.date, i18n.language)
                            : formatDateShortWithRelevantTime(
                                  shownDate.date,
                                  i18n.language,
                                  `(${t("progress.amsterdam_time")})`,
                              )}
                    </Text>
                )}
            </div>
        </Disclosure.Header>
    );
}

function getHeaderDate(
    step: WorkflowStep,
    submissions: Submission[],
    nested: boolean,
    currentStep: WorkflowInstance["currentStep"],
) {
    // Outer cards retain their completion date; rows use visible submissions and history.
    const submissionDates = nested
        ? [
              ...submissions.map((submission) => submission.dateSubmitted),
              ...(step.versions
                  ?.filter((version) => version.submissions.length > 0)
                  .map((version) => version.submittedAt) ?? []),
          ]
        : [step.dateCompleted, ...(step.children?.map((child) => child.dateCompleted) ?? [])];
    const submittedDate = latestDate(submissionDates);
    if (submittedDate) return {date: submittedDate, submitted: true};

    const deadlineDate =
        step.deadline?.date ??
        step.children?.find((child) => child.id === currentStep)?.deadline?.date;
    if (deadlineDate) return {date: deadlineDate, submitted: false};

    return null;
}
