import {useState} from "react";

import {Button, Disclosure, Heading, Modal} from "@datanose/ui";

import {FormPage} from "./FormPage.tsx";
import {FormModal} from "~/components/instance/FormModal.tsx";
import {VersionCard} from "~/components/instance/VersionCard.tsx";
import {useTranslate} from "~/hooks/useTranslate.ts";
import {actionsEndpoints} from "~/store/api/actionsApi.ts";
import type {Action, WorkflowInstance, WorkflowStep} from "~/store/api/types/instances.ts";
import {actionIntentToButtonProps} from "~/utils/actionIntentToButtonProps.ts";

type Props = {
    step: WorkflowStep;
    instance: WorkflowInstance;
};

export const StepCard = ({step, instance}: Props) => {
    const {t, l} = useTranslate("workflow", {keyPrefix: "step_card"});
    const [activeAction, setActiveAction] = useState<Action | null>(null);

    const [executeAction] = actionsEndpoints.executeAction.useMutation();

    const stepIds = [step.id, ...(step.children?.map((s) => s.id) ?? [])];
    const actions = instance.actions.filter((a) => a.step && stepIds.includes(a.step));
    const isFormOpen = activeAction?.type === "SubmitForm" && activeAction.formLayout !== "Modal";
    const isCurrentStep = stepIds.includes(instance.currentStep);

    return (
        <Disclosure defaultExpanded={isCurrentStep}>
            <Disclosure.Header>
                <Heading>{l(step.title)}</Heading>
            </Disclosure.Header>
            <Disclosure.Content>
                <div className="flex flex-col gap-4">
                    {isFormOpen && (
                        <FormPage
                            instanceId={instance.id}
                            submissionId={activeAction?.form ?? ""}
                            onClose={() => setActiveAction(null)}
                        />
                    )}

                    {/* Action buttons */}
                    {!isFormOpen && (
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
                    {step.versions?.map((v) => (
                        <VersionCard key={v.versionNumber} version={v} instanceId={instance.id} />
                    ))}
                </div>

                <Modal
                    isOpen={activeAction?.type === "Execute"}
                    onOpenChange={() => setActiveAction(null)}
                >
                    <Modal.Header>{activeAction && l(activeAction.title)}</Modal.Header>
                    <Modal.Body className="mt-2 mb-4">
                        <p>{t("are_you_sure")}</p>
                    </Modal.Body>
                    {activeAction && (
                        <Modal.Footer className="mt-2 flex gap-2">
                            <Button intent="secondary" onClick={() => setActiveAction(null)}>
                                {t("cancel")}
                            </Button>
                            <Button
                                intent="primary"
                                variant="destructive"
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
