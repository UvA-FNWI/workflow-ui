import {useState} from "react";

import {Disclosure} from "@uva-fnwi/datanose-ui";

import {
    getStepHierarchy,
    resolveFormState,
} from "~/components/instance/StepCard/resolveContentState.ts";
import {StepCardBody} from "~/components/instance/StepCard/StepCardBody.tsx";
import {StepCardHeader} from "~/components/instance/StepCard/StepCardHeader.tsx";
import {MarkdownRenderer} from "~/components/MarkdownRenderer.tsx";
import {useTranslate} from "~/hooks/useTranslate.ts";
import type {Action, WorkflowInstance, WorkflowStep} from "~/store/api/types/instances.ts";

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

    // A refresh can revoke an action while its form or modal is still open.
    const availableActiveAction = actions.find((action) => action.id === activeAction?.id) ?? null;
    const resolvedAction = availableActiveAction ?? autoOpenAction;

    const deadlineMessages = stepHierarchy.filter(
        (candidate) =>
            candidate.deadline?.message != null ||
            (candidate.deadline?.type === "Hard" && candidate.deadline.isPassed),
    );

    const isCurrentStep = stepIds.includes(instance.currentStep ?? "");
    const currentStepIndex = instance.steps.findIndex((s) =>
        [s.id, ...(s.children?.map((c) => c.id) ?? [])].includes(instance.currentStep ?? ""),
    );
    const isAfterCurrentStep = instance.steps.indexOf(step) > currentStepIndex;

    // An unfinished alongside obligation can move the current step backward. Steps that are
    // already completed or still have available actions must remain usable regardless of order.
    const isUnavailableFutureStep =
        !step.dateCompleted &&
        deadlineMessages.length === 0 &&
        actions.length === 0 &&
        !!instance.currentStep &&
        !isCurrentStep &&
        isAfterCurrentStep;

    const formState = resolveFormState(resolvedAction);
    const hasVisibleSubmission = submissions.length > 0 || step.versions?.current != null;

    const emptyStateMessage =
        !formState &&
        !hasVisibleSubmission &&
        stepHierarchy.some(({hasSubmission}) => hasSubmission)
            ? t("instance.unauthorized_submission")
            : !formState && stepHierarchy.some(({expectsSubmission}) => expectsSubmission)
              ? t("instance.empty_step")
              : null;
    const hasStepContent =
        actions.length > 0 ||
        submissions.length > 0 ||
        (step.versions?.history.length ?? 0) > 0 ||
        step.resultsType !== "Normal" ||
        emptyStateMessage !== null;
    const hasBodyContent = deadlineMessages.length > 0 || hasStepContent;
    const isContentless = !isUnavailableFutureStep && !hasBodyContent;

    return (
        <Disclosure
            defaultExpanded={isCurrentStep && hasBodyContent}
            isDisabled={isUnavailableFutureStep || !hasBodyContent}
            className={isContentless ? "cursor-default! opacity-100!" : undefined}
        >
            <Disclosure.Header
                showChevron={hasBodyContent}
                className={isContentless ? "cursor-default!" : undefined}
            >
                <StepCardHeader step={step} currentStepId={instance.currentStep} />
            </Disclosure.Header>
            {hasBodyContent && (
                <Disclosure.Content>
                    {deadlineMessages.map((candidate) => (
                        <div key={candidate.id} className="pt-4">
                            <MarkdownRenderer>
                                {l(candidate.deadline?.message) || t("instance.deadline_passed")}
                            </MarkdownRenderer>
                        </div>
                    ))}
                    {hasStepContent && (
                        <StepCardBody
                            step={step}
                            instance={instance}
                            actions={actions}
                            submissions={submissions}
                            activeAction={availableActiveAction}
                            formState={formState}
                            emptyStateMessage={emptyStateMessage}
                            onSelectAction={setActiveAction}
                        />
                    )}
                </Disclosure.Content>
            )}
        </Disclosure>
    );
};
