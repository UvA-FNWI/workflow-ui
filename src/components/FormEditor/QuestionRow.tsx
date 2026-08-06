import {useRef, useState} from "react";

import {Button, Checkbox, Icon, Input, Pill, Popover, usePopoverState} from "@uva-fnwi/datanose-ui";

import {ChoiceEditor} from "~/components/FormEditor/ChoiceEditor";
import {
    type EditorQuestion,
    type QuestionPatch,
    readOnlyReason,
} from "~/components/FormEditor/model";
import {useTranslate} from "~/hooks/useTranslate";

type Props = {
    question: EditorQuestion;
    onChange: (patch: QuestionPatch) => void;
    onRemove: () => void;
    onAddChoice: () => void;
    onUpdateChoice: (choiceName: string, textNl: string) => void;
    onRemoveChoice: (choiceName: string) => void;
    dragHandle?: React.ReactNode;
};

const HAS_CHOICES = ["SingleChoice", "MultipleChoice"];

export function QuestionRow({
    question,
    onChange,
    onRemove,
    onAddChoice,
    onUpdateChoice,
    onRemoveChoice,
    dragHandle,
}: Props) {
    const {t} = useTranslate("workflow");
    const popover = usePopoverState();
    const triggerRef = useRef<HTMLButtonElement>(null);
    const [nameDraft, setNameDraft] = useState<string | null>(null);
    const reason = readOnlyReason(question);
    const readOnly = reason !== null;
    const kindLabel =
        question.kind === "Unknown"
            ? question.rawType ||
              t(`form_editor.kind.${reason === "missing" ? "Missing" : "Unknown"}`)
            : t(`form_editor.kind.${question.kind}`);

    return (
        <div
            className={`border-b border-grey-200 py-2 ${
                readOnly ? "bg-grey-50 border-l-2 border-l-grey-300 pl-2 dark:bg-grey-800" : ""
            }`}
        >
            <div className="flex items-start gap-3">
                <div className="pt-2">{dragHandle}</div>
                <div className="w-32 shrink-0 pt-2 text-sm text-grey-700">{kindLabel}</div>
                <div className="grow">
                    <Input
                        aria-label={t("form_editor.question_text")}
                        value={question.text.nl}
                        isDisabled={readOnly}
                        onChange={(value) => onChange({textNl: value})}
                    />
                    <div className="mt-1 flex items-center gap-2 text-xs text-grey-600">
                        <Pill variant="grey">{question.name}</Pill>
                        {reason && (
                            <span
                                className={`flex items-center gap-1 ${
                                    reason === "missing" ? "text-red-600 dark:text-red-400" : ""
                                }`}
                            >
                                <Icon
                                    name={
                                        reason === "missing"
                                            ? "triangle-exclamation-line"
                                            : "lock-line"
                                    }
                                    decorative
                                />
                                {t(`form_editor.read_only.${reason}`, {
                                    file: question.definedIn,
                                    name: question.name,
                                })}
                            </span>
                        )}
                    </div>
                </div>
                <Button
                    ref={triggerRef}
                    intent="ghost"
                    size="square"
                    aria-label={t("form_editor.options")}
                    aria-expanded={popover.isOpen}
                    aria-haspopup="dialog"
                    onClick={popover.toggle}
                >
                    <Icon name="dots-single-line" decorative />
                </Button>
                {popover.isOpen && (
                    <Popover
                        state={popover}
                        triggerRef={triggerRef as React.RefObject<HTMLElement>}
                        placement="bottom end"
                        className="border border-grey-500 bg-white shadow-md outline-none dark:bg-grey-800"
                    >
                        <dialog
                            open
                            aria-label={t("form_editor.options")}
                            className="relative m-0 flex w-72 flex-col gap-3 p-3"
                        >
                            <Checkbox
                                label={t("form_editor.required")}
                                isSelected={question.isRequired}
                                isDisabled={readOnly}
                                onChange={(isSelected) => onChange({isRequired: isSelected})}
                            />
                            <Input
                                label={t("form_editor.text_en")}
                                value={question.text.en}
                                isDisabled={readOnly}
                                onChange={(value) => onChange({textEn: value})}
                            />
                            <Input
                                label={t("form_editor.description_nl")}
                                value={question.description.nl}
                                isDisabled={readOnly}
                                onChange={(value) => onChange({descriptionNl: value})}
                            />
                            <Input
                                label={t("form_editor.description_en")}
                                value={question.description.en}
                                isDisabled={readOnly}
                                onChange={(value) => onChange({descriptionEn: value})}
                            />
                            <Input
                                label={t("form_editor.internal_name")}
                                value={nameDraft ?? question.name}
                                isDisabled={readOnly}
                                description={t("form_editor.internal_name_warning")}
                                onChange={setNameDraft}
                                onBlur={() => {
                                    if (nameDraft !== null && nameDraft !== question.name) {
                                        onChange({name: nameDraft});
                                    }
                                    setNameDraft(null);
                                }}
                            />
                        </dialog>
                    </Popover>
                )}
                <Button
                    intent="ghost"
                    size="square"
                    aria-label={t("form_editor.remove")}
                    onClick={onRemove}
                >
                    <Icon name="trash-line" decorative />
                </Button>
            </div>
            {HAS_CHOICES.includes(question.kind) && (
                <ChoiceEditor
                    question={question}
                    isDisabled={readOnly}
                    onAdd={onAddChoice}
                    onUpdate={onUpdateChoice}
                    onRemove={onRemoveChoice}
                />
            )}
        </div>
    );
}
