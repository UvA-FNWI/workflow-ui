import {useState} from "react";

import {Button} from "@uva-fnwi/datanose-ui";

import {getExtendableDeadlines} from "./deadlines/postponeDeadline";
import {PostponeDeadlineModal} from "./deadlines/PostponeDeadlineModal";
import {FormModal} from "./FormModal";
import {useTranslate} from "~/hooks/useTranslate";
import type {Action, WorkflowStep} from "~/store/api/types/instances";
import {actionIntentToButtonProps} from "~/utils/actionIntentToButtonProps";

type Props = {instanceId: string; actions: Action[]; steps?: WorkflowStep[]};

export function WorkflowActions({instanceId, actions, steps = []}: Props) {
    const {l} = useTranslate("workflow");
    const [selectedAction, setSelectedAction] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    function renderModal(action: Action) {
        const onClose = () => setSelectedAction(null);
        switch (action.type) {
            case "SubmitForm":
                return action.form ? (
                    <FormModal
                        key={action.id}
                        isOpen
                        instanceId={instanceId}
                        submissionId={action.form}
                        onClose={onClose}
                        onLoadingChange={setIsLoading}
                    />
                ) : null;
            case "PostponeDeadlines":
                return action.modalForm ? (
                    <PostponeDeadlineModal
                        key={action.id}
                        instanceId={instanceId}
                        actionName={action.name}
                        form={action.modalForm}
                        deadlines={getExtendableDeadlines(steps)}
                        onClose={onClose}
                    />
                ) : null;
            default:
                return null;
        }
    }

    const buttons = actions
        .filter(
            (action) =>
                action.steps.length === 0 &&
                (action.type === "PostponeDeadlines" || action.formLayout === "Modal"),
        )
        .map((action) => ({action, modal: renderModal(action)}))
        .filter(({modal}) => modal !== null);
    const active = buttons.find(({action}) => action.id === selectedAction);

    return (
        <>
            {buttons.map(({action}) => (
                <Button
                    key={action.id}
                    {...actionIntentToButtonProps(action.intent)}
                    isLoading={active?.action.id === action.id && isLoading}
                    onClick={() => {
                        setIsLoading(action.type === "SubmitForm");
                        setSelectedAction(action.id);
                    }}
                >
                    {l(action.title)}
                </Button>
            ))}
            {active?.modal}
        </>
    );
}
