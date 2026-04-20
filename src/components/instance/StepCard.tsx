import {useState} from "react";

import {Button, Disclosure, Heading, Modal, Pill, Text} from "@datanose/ui";
import {Separator} from "@datanose/ui";
import i18n from "i18next";

import {FormPage} from "./FormPage.tsx";
import {FormModal} from "~/components/instance/FormModal.tsx";
import {FormSummary} from "~/components/instance/FormSummary.tsx";
import {VersionCard} from "~/components/instance/VersionCard.tsx";
import {useTranslate} from "~/hooks/useTranslate.ts";
import {actionsEndpoints} from "~/store/api/actionsApi.ts";
import type {Action, WorkflowInstance, WorkflowStep} from "~/store/api/types/instances.ts";
import {actionIntentToButtonProps} from "~/utils/actionIntentToButtonProps.ts";
import {formatDateShort} from "~/utils/formatDate.ts";

type Props = {
    step: WorkflowStep;
    instance: WorkflowInstance;
};

export const StepCard = ({step, instance}: Props) => {
    const {t, l} = useTranslate("workflow");
    const [activeAction, setActiveAction] = useState<Action | null>(null);

    const [executeAction] = actionsEndpoints.executeAction.useMutation();

    const stepIds = [step.id, ...(step.children?.map((s) => s.id) ?? [])];
    const actions = instance.actions.filter((action) =>
        action.steps.some((actionStepId) => stepIds.includes(actionStepId)),
    );
    const submissions = instance.submissions.filter((s) => s.form.step === step.id);
    const isFormOpen = activeAction?.type === "SubmitForm" && activeAction.formLayout !== "Modal";
    const isCurrentStep = stepIds.includes(instance.currentStep ?? "");

    const stepStatus =
        [
            {type: "status.submitted" as const, date: step.versions?.at(-1)?.submittedAt},
            {type: "progress.deadline" as const, date: step.deadline},
        ].find((status) => status.date) ?? null;

    const isDisabled =
        !isCurrentStep &&
        instance.steps.indexOf(step) >
            instance.steps.findIndex((s) => instance.currentStep?.includes(s.id));

    const hasMultipleVersions = (step.versions?.length ?? 0) > 1;
    const submissionsToShow =
        submissions.length > 0
            ? submissions
            : step.versions?.length == 1
              ? step.versions[0].submissions
              : [];

    return (
        <Disclosure defaultExpanded={isCurrentStep} isDisabled={isDisabled}>
            <Disclosure.Header>
                <div className="flex w-full flex-col items-start gap-2 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex min-w-0 flex-wrap items-center gap-2">
                        <Heading>{l(step.title)}</Heading>
                        {step.dateCompleted && (
                            <Pill variant="green">
                                {t("status.completed_on")}{" "}
                                {formatDateShort(step.dateCompleted, i18n.language)}
                            </Pill>
                        )}
                    </div>
                    {stepStatus?.date && (
                        <Text as="span" className="shrink-0">
                            <Text fontWeight="semibold">{t(stepStatus.type)}</Text>
                            {":\t"}
                            {formatDateShort(stepStatus?.date, i18n.language)}
                        </Text>
                    )}
                </div>
            </Disclosure.Header>
            <Disclosure.Content>
                <div className="flex flex-col gap-4">
                    {submissionsToShow.map((submission) => (
                        <div key={submission.id} className="py-4">
                            <FormSummary instanceId={instance.id} submission={submission} />
                        </div>
                    ))}

                    {isFormOpen && (
                        <div className="py-4">
                            <FormPage
                                instanceId={instance.id}
                                submissionId={activeAction?.form ?? ""}
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
                    {hasMultipleVersions &&
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
