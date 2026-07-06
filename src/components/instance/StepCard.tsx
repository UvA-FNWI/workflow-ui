import {useState} from "react";

import {
    Button,
    Disclosure,
    Heading,
    Modal,
    Pill,
    type PillVariantProps,
    Separator,
    Text,
} from "@uva-fnwi/datanose-ui";
import i18n from "i18next";

import {FormPage} from "./FormPage.tsx";
import {FormModal} from "~/components/instance/FormModal.tsx";
import {FormSummary} from "~/components/instance/FormSummary.tsx";
import {FormSummaryAssessment} from "~/components/instance/FormSummaryAssessment.tsx";
import {VersionCard} from "~/components/instance/VersionCard.tsx";
import {useTranslate} from "~/hooks/useTranslate.ts";
import {actionsEndpoints} from "~/store/api/actionsApi.ts";
import type {
    Action,
    StepHeaderStatus,
    WorkflowInstance,
    WorkflowStep,
} from "~/store/api/types/instances.ts";
import type {Submission} from "~/store/api/types/submissions.ts";
import {actionIntentToButtonProps} from "~/utils/actionIntentToButtonProps.ts";
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

const hasResults = (submission: Submission) => submission.form.pages.some((p) => p.hasResults);

const getStepHierarchy = (step: WorkflowStep): WorkflowStep[] => [
    step,
    ...(step.children ?? []).flatMap((child) => getStepHierarchy(child)),
];

export const StepCard = ({step, instance}: Props) => {
    const {t, l} = useTranslate("workflow");

    const [executeAction] = actionsEndpoints.executeAction.useMutation();

    const stepIds = getStepHierarchy(step).map((s) => s.id);
    const actions = instance.actions.filter((action) =>
        action.steps.some((actionStepId) => stepIds.includes(actionStepId)),
    );
    const submissions = instance.submissions.filter((s) => stepIds.includes(s.form.step ?? ""));

    const shouldAutoOpenForm = (action: Action) =>
        action.type === "SubmitForm" &&
        action.autoOpenForm !== false &&
        !submissions.some((s) => s.dateSubmitted && s.form.name === action.form);

    const autoOpenAction =
        actions.length === 1 && actions[0] && shouldAutoOpenForm(actions[0]) ? actions[0] : null;

    const [activeAction, setActiveAction] = useState<Action | null>(autoOpenAction);

    const resolvedAction = activeAction ?? autoOpenAction;
    const isFormOpen =
        resolvedAction?.type === "SubmitForm" && resolvedAction.formLayout !== "Modal";
    const isCurrentStep = stepIds.includes(instance.currentStep ?? "");
    const currentStepIndex = instance.steps.findIndex((s) =>
        [s.id, ...(s.children?.map((c) => c.id) ?? [])].includes(instance.currentStep ?? ""),
    );

    const deadlineDate = step.deadline ?? null;

    const isDisabled =
        !!instance.currentStep && !isCurrentStep && instance.steps.indexOf(step) > currentStepIndex;
    const showVersionCards = (step.versions?.flatMap((v) => v.submissions ?? []).length ?? 0) > 1;

    const submissionsToShow =
        submissions.length > 0
            ? submissions
            : step.versions?.length == 1
              ? step.versions[0].submissions
              : [];

    const regularSubmissions = submissionsToShow.filter((s) => !hasResults(s) && s.answers.length);
    const assessmentSubmissions = submissionsToShow.filter((s) => hasResults(s));

    const showEmptyMessage =
        !isFormOpen &&
        submissionsToShow.length === 0 &&
        actions.length === 0 &&
        !isDisabled &&
        !showVersionCards &&
        step.resultsType === "Normal";

    return (
        <Disclosure defaultExpanded={isCurrentStep} isDisabled={isDisabled}>
            <Disclosure.Header>
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
                <div className="flex flex-col gap-4">
                    {showEmptyMessage && (
                        <div className="pt-4">
                            <Text className="italic">{t("instance.empty_step")}</Text>
                        </div>
                    )}
                    {regularSubmissions.map((submission) => (
                        <div key={submission.id} className="py-4">
                            <FormSummary
                                instanceId={instance.id}
                                submission={submission}
                                permissions={instance.permissions}
                            />
                        </div>
                    ))}

                    {(assessmentSubmissions.length > 0 || step.resultsType !== "Normal") && (
                        <FormSummaryAssessment
                            instanceId={instance.id}
                            submissions={assessmentSubmissions}
                            combine={true}
                            step={step}
                        />
                    )}

                    {isFormOpen && (
                        <div className="py-4">
                            <FormPage
                                instanceId={instance.id}
                                submissionId={resolvedAction?.form ?? ""}
                                onClose={() => setActiveAction(null)}
                            />
                        </div>
                    )}

                    {/* Action buttons */}
                    {!isFormOpen && actions.length > 0 && (
                        <div className="flex gap-2 pt-2">
                            {actions.map((a) => (
                                <Button
                                    key={a.id}
                                    onClick={() => setActiveAction(a)}
                                    {...actionIntentToButtonProps(a.intent)}
                                >
                                    {l(a.title)}
                                </Button>
                            ))}
                        </div>
                    )}
                    {showVersionCards &&
                        step.versions?.some((version) => version.submissions?.length > 0) && (
                            <div className="flex flex-col">
                                {step.versions
                                    .filter((v) => v.submissions.length > 0)
                                    .map(
                                        (v, index, arr) =>
                                            v.submissions.length > 0 && (
                                                <div key={v.versionNumber}>
                                                    {index > 0 && <Separator />}
                                                    <VersionCard
                                                        version={v}
                                                        instanceId={instance.id}
                                                        isExpandedByDefault={
                                                            submissionsToShow.length === 0 &&
                                                            index === 0
                                                        }
                                                    />
                                                    {index === arr.length - 1 && <Separator />}
                                                </div>
                                            ),
                                    )}
                            </div>
                        )}
                </div>
                <Modal
                    isOpen={activeAction?.type === "Execute"}
                    onOpenChange={() => setActiveAction(null)}
                >
                    <Modal.Header className="pb-0 text-2xl font-semibold">
                        {activeAction && l(activeAction.title)}
                    </Modal.Header>
                    <Modal.Body className="mt-2 text-lg">
                        <p>{t("are_you_sure")}</p>
                    </Modal.Body>
                    {activeAction && (
                        <Modal.Footer>
                            <Button
                                intent="primary"
                                variant="destructive"
                                size="large"
                                onClick={() => {
                                    executeAction({
                                        instanceId: instance.id,
                                        name: activeAction.name,
                                        type: activeAction.type,
                                    });
                                    setActiveAction(null);
                                }}
                            >
                                {t("confirm")}
                            </Button>
                            <Button
                                intent="secondary"
                                variant="destructive"
                                size="large"
                                onClick={() => setActiveAction(null)}
                            >
                                {t("cancel")}
                            </Button>
                        </Modal.Footer>
                    )}
                </Modal>
                <FormModal
                    isOpen={
                        activeAction?.type === "SubmitForm" && activeAction.formLayout === "Modal"
                    }
                    onClose={() => setActiveAction(null)}
                    instanceId={instance.id}
                    submissionId={activeAction?.form ?? ""}
                />
            </Disclosure.Content>
        </Disclosure>
    );
};
