import {useState} from "react";

import {Card, Heading, Modal, Separator} from "@datanose/ui";

import {FormPage} from "./FormPage.tsx";
import {useTranslate} from "~/hooks/useTranslate.ts";
import {actionsEndpoints} from "~/store/api/actionsApi.ts";
import type {Action, WorkflowInstance, WorkflowStep} from "~/store/api/types/instances.ts";

type Props = {
    step: WorkflowStep;
    instance: WorkflowInstance;
};

export const StepCard = ({step, instance}: Props) => {
    const {t, l} = useTranslate("workflow");
    const [activeAction, setActiveAction] = useState<Action | null>(null);

    const [executeAction] = actionsEndpoints.executeAction.useMutation();

    const stepIds = [step.id, ...(step.children?.map((s) => s.id) ?? [])];
    const actions = instance.actions.filter((a) => a.step && stepIds.includes(a.step));
    const submissions = instance.submissions.filter((s) => s.form.step === step.id);

    return (
        <Card>
            <div className="flex flex-col gap-4">
                <Heading>{l(step.title)}</Heading>
                <Separator />
                {submissions.length > 0 && (
                    <FormPage
                        instanceId={instance.id}
                        submissionId={submissions[0].id}
                        actions={actions}
                        setActiveAction={setActiveAction}
                    />
                )}
            </div>

            <Modal isOpen={activeAction !== null} onOpenChange={() => setActiveAction(null)}>
                <Modal.Header>{activeAction && l(activeAction.title)}</Modal.Header>
                <Modal.Body className="mt-2 mb-4">TODO: body text.</Modal.Body>
                {activeAction && (
                    <Modal.Footer className="mt-2 flex gap-2">
                        <button
                            className="rounded-md border px-3 py-1.5 text-base"
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
                        </button>
                        <button
                            className="rounded-md border px-3 py-1.5 text-base"
                            onClick={() => setActiveAction(null)}
                        >
                            {t("cancel")}
                        </button>
                    </Modal.Footer>
                )}
            </Modal>
        </Card>
    );
};
