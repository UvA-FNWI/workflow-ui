import {useState} from "react";

import {Disclosure, Heading, Pill, type PillVariantProps, Text} from "@uva-fnwi/datanose-ui";
import i18n from "i18next";

import {
    getResolvedAction,
    getStepHierarchy,
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

export const StepCard = ({step, instance}: Props) => {
    const {t, l} = useTranslate("workflow");
    const [activeAction, setActiveAction] = useState<Action | null>(null);

    const stepIds = getStepHierarchy(step).map((s) => s.id);
    const actions = instance.actions.filter((action) =>
        action.steps.some((actionStepId) => stepIds.includes(actionStepId)),
    );
    const submissions = instance.submissions.filter((s) => stepIds.includes(s.form.step ?? ""));

    const resolvedAction = getResolvedAction(activeAction, actions, submissions);
    const isCurrentStep = stepIds.includes(instance.currentStep ?? "");
    const currentStepIndex = instance.steps.findIndex((s) =>
        [s.id, ...(s.children?.map((c) => c.id) ?? [])].includes(instance.currentStep ?? ""),
    );

    const deadlineDate = step.deadline ?? null;
    const isDisabled =
        !!instance.currentStep && !isCurrentStep && instance.steps.indexOf(step) > currentStepIndex;

    const contentState = resolveContentState({
        step,
        actions,
        submissions,
        activeAction: resolvedAction,
        isDisabled,
    });
    const modalState = resolveModalState(activeAction);

    return (
        <Disclosure defaultExpanded={isCurrentStep} isDisabled={isDisabled}>
            <Disclosure.Header>
                <div className="flex w-full flex-col items-start gap-2 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex min-w-0 flex-wrap items-center gap-2">
                        <Heading>{l(step.title)}</Heading>
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
                    {deadlineDate && (
                        <Text as="span" className="shrink-0">
                            <Text fontWeight="semibold">{t("progress.deadline")}</Text>
                            {":\t"}
                            {formatDateShort(deadlineDate, i18n.language)}
                        </Text>
                    )}
                </div>
            </Disclosure.Header>
            <Disclosure.Content>
                <StepCardBody
                    step={step}
                    instance={instance}
                    actions={actions}
                    submissions={submissions}
                    contentState={contentState}
                    modalState={modalState}
                    activeAction={activeAction}
                    setActiveAction={setActiveAction}
                />
            </Disclosure.Content>
        </Disclosure>
    );
};
