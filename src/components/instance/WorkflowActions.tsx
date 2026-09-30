import {useState} from "react";

import {Button} from "@uva-fnwi/datanose-ui";

import {FormModal} from "./FormModal";
import {useTranslate} from "~/hooks/useTranslate";
import type {Action} from "~/store/api/types/instances";
import {actionIntentToButtonProps} from "~/utils/actionIntentToButtonProps";

type Props = {instanceId: string; actions: Action[]};

export function WorkflowActions({instanceId, actions}: Props) {
    const {l} = useTranslate("workflow");
    const [selectedAction, setSelectedAction] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    const buttons = actions.filter(
        (action) =>
            action.type === "SubmitForm" &&
            action.form &&
            action.steps.length === 0 &&
            action.formLayout === "Modal",
    );
    const active = buttons.find((action) => action.id === selectedAction);

    return (
        <>
            {buttons.map((action) => (
                <Button
                    key={action.id}
                    {...actionIntentToButtonProps(action.intent)}
                    isLoading={active?.id === action.id && isLoading}
                    onClick={() => {
                        setIsLoading(true);
                        setSelectedAction(action.id);
                    }}
                >
                    {l(action.title)}
                </Button>
            ))}
            {active?.form && (
                <FormModal
                    key={active.id}
                    isOpen
                    instanceId={instanceId}
                    submissionId={active.form}
                    onClose={() => setSelectedAction(null)}
                    onLoadingChange={setIsLoading}
                />
            )}
        </>
    );
}
