import {Button, Icon, Input} from "@uva-fnwi/datanose-ui";

import type {EditorQuestion} from "~/components/FormEditor/model";
import {useTranslate} from "~/hooks/useTranslate";

type Props = {
    question: EditorQuestion;
    isDisabled: boolean;
    onAdd: () => void;
    onUpdate: (choiceName: string, textNl: string) => void;
    onRemove: (choiceName: string) => void;
};

export function ChoiceEditor({question, isDisabled, onAdd, onUpdate, onRemove}: Props) {
    const {t} = useTranslate("workflow");

    return (
        <div className="mt-2 ml-8 flex flex-col gap-2">
            {question.choices.map((choice) => (
                <div key={choice.name} className="flex items-center gap-2">
                    <Input
                        aria-label={t("form_editor.choice_text")}
                        value={choice.text.nl}
                        isDisabled={isDisabled}
                        onChange={(value) => onUpdate(choice.name, value)}
                    />
                    <Button
                        intent="ghost"
                        size="square"
                        aria-label={t("form_editor.remove_choice")}
                        disabled={isDisabled}
                        onClick={() => onRemove(choice.name)}
                    >
                        <Icon name="trash-line" decorative />
                    </Button>
                </div>
            ))}
            <Button
                intent="secondary"
                variant="destructive"
                size="small"
                className="self-start"
                disabled={isDisabled}
                leftIcon={<Icon name="plus-line" size="sm" color="current" decorative />}
                onClick={onAdd}
            >
                {t("form_editor.add_choice")}
            </Button>
        </div>
    );
}
