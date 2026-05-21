import {useCallback, useState} from "react";

import {useNavigate} from "react-router";

import {Button, Modal, Select, SelectItem, useToast} from "@uva-fnwi/datanose-ui";

import type {LocalString} from "~/hooks/useTranslate";
import {useTranslate} from "~/hooks/useTranslate";
import {definitionsEndpoints} from "~/store/api/definitionsApi";
import {instancesEndpoints} from "~/store/api/instancesApi";
import type {WorkflowInstance, WorkflowStep} from "~/store/api/types/instances";

function getCurrentStepLabel(
    steps: WorkflowStep[],
    currentStep: string | null,
    l: (localString?: LocalString | null) => string | undefined,
): string | undefined {
    if (!currentStep) return undefined;

    const stepIndex = steps.findIndex(
        (step) =>
            step.id === currentStep || step.children?.some((child) => child.id === currentStep),
    );
    if (stepIndex === -1) return currentStep;

    const step = steps[stepIndex];
    const childStep = step.children?.find((child) => child.id === currentStep);
    const activeStep = childStep ?? step;

    return l(activeStep.title) ?? activeStep.id;
}

type CreateWorkflowInstanceModalProps = {
    isOpen: boolean;
    onOpenChange: (isOpen: boolean) => void;
};

export function CreateWorkflowInstanceModal({
    isOpen,
    onOpenChange,
}: CreateWorkflowInstanceModalProps) {
    const navigate = useNavigate();
    const toast = useToast();
    const {t, l} = useTranslate(["common", "workflow"]);
    const [selectedDefinition, setSelectedDefinition] = useState("");

    const showCreateResultToast = useCallback(
        (instance: WorkflowInstance) => {
            const status = getCurrentStepLabel(instance.steps, instance.currentStep, l);
            if (status) {
                toast.success(t("create_instance_success", {ns: "common", status}));
            } else {
                toast.success(t("create_instance_success_no_status", {ns: "common"}));
            }
        },
        [l, t, toast],
    );

    const {
        data: definitions,
        isLoading,
        isError,
    } = definitionsEndpoints.getWorkflowDefinitions.useQuery(undefined, {skip: !isOpen});

    const [createInstance, {isLoading: isCreating}] =
        instancesEndpoints.createWorkflowInstance.useMutation();

    const handleCreate = useCallback(async () => {
        if (!selectedDefinition) return;

        try {
            const instance = await createInstance({
                workflowDefinition: selectedDefinition,
            }).unwrap();
            showCreateResultToast(instance);
            onOpenChange(false);
            setSelectedDefinition("");
            if (instance.id) {
                navigate(`/instance/${instance.id}`);
            }
        } catch {
            toast.error(t("create_instance_failed", {ns: "common"}));
        }
    }, [
        createInstance,
        navigate,
        onOpenChange,
        selectedDefinition,
        showCreateResultToast,
        t,
        toast,
    ]);

    const handleOpenChange = useCallback(
        (open: boolean) => {
            if (!open) {
                setSelectedDefinition("");
            }
            onOpenChange(open);
        },
        [onOpenChange],
    );

    return (
        <Modal isOpen={isOpen} onOpenChange={handleOpenChange}>
            <Modal.Header>{t("create_instance_modal_title", {ns: "common"})}</Modal.Header>
            <Modal.Body>
                {isLoading && <p>{t("create_instance_loading", {ns: "common"})}</p>}
                {isError && <p>{t("create_instance_error", {ns: "common"})}</p>}
                {!isLoading && !isError && definitions && definitions.length === 0 && (
                    <p>{t("create_instance_empty", {ns: "common"})}</p>
                )}
                {!isLoading && !isError && definitions && definitions.length > 0 && (
                    <Select
                        label={t("create_instance_definition_label", {ns: "common"})}
                        placeholder={t("create_instance_definition_placeholder", {ns: "common"})}
                        value={selectedDefinition || undefined}
                        onChange={(value) =>
                            setSelectedDefinition(value != null ? String(value) : "")
                        }
                        isRequired
                    >
                        {definitions.map((definition) => (
                            <SelectItem key={definition.name}>
                                {l(definition.title) ?? definition.name}
                            </SelectItem>
                        ))}
                    </Select>
                )}
            </Modal.Body>
            <Modal.Footer>
                <Button
                    intent="primary"
                    onClick={() => void handleCreate()}
                    disabled={!selectedDefinition || isCreating}
                >
                    {t("create_instance_create", {ns: "common"})}
                </Button>
                <Button
                    intent="secondary"
                    variant="destructive"
                    onClick={() => handleOpenChange(false)}
                    className="ml-auto"
                >
                    {t("cancel", {ns: "workflow"})}
                </Button>
            </Modal.Footer>
        </Modal>
    );
}
