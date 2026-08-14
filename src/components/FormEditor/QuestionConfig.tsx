import {useState} from "react";

import {Button, Checkbox, Disclosure, Icon, Input, Radio, RadioGroup} from "@uva-fnwi/datanose-ui";

import {BilingualPair} from "~/components/FormEditor/BilingualPair";
import {
    addChoice,
    type ConfigDocs,
    type EditorQuestion,
    parseTypeString,
    type QuestionKind,
    type QuestionPatch,
    removeChoice,
    updateChoice,
    updateQuestion,
} from "~/components/FormEditor/model";
import {useTranslate} from "~/hooks/useTranslate";

type Props = {
    docs: ConfigDocs;
    formPath: string;
    question: EditorQuestion;
    isDisabled: boolean;
    apply: (action: () => string[]) => void;
};

const CHOICE_KINDS: QuestionKind[] = ["SingleChoice", "MultipleChoice"];
const PERSON_KINDS: QuestionKind[] = ["Person", "People"];
const CHOICE_LAYOUTS = ["RadioList", "Dropdown"] as const;

export function QuestionConfig({docs, formPath, question, isDisabled, apply}: Props) {
    const {t} = useTranslate("workflow");
    const [nameDraft, setNameDraft] = useState<string | null>(null);
    const patch = (key: keyof QuestionPatch, value: string | boolean) =>
        apply(() => updateQuestion(docs, formPath, question.name, {[key]: value} as QuestionPatch));
    const layout = (question.raw.layout ?? {}) as {type?: string; multiline?: boolean};
    const isDecimal = parseTypeString(question.rawType).underlying === "Double";

    return (
        <div className="flex flex-col gap-4">
            <BilingualPair
                label={t("form_editor.question_text")}
                value={question.text}
                isDisabled={isDisabled}
                onChange={(language, next) => patch(language === "nl" ? "textNl" : "textEn", next)}
            />
            <BilingualPair
                label={t("form_editor.description")}
                value={question.description}
                isDisabled={isDisabled}
                onChange={(language, next) =>
                    patch(language === "nl" ? "descriptionNl" : "descriptionEn", next)
                }
            />

            <div className="flex flex-wrap items-center gap-4">
                <Checkbox
                    label={t("form_editor.required")}
                    isSelected={question.isRequired}
                    isDisabled={isDisabled}
                    onChange={(isSelected) => patch("isRequired", isSelected)}
                />
                {question.kind === "TextField" && (
                    <Checkbox
                        label={t("form_editor.long_text")}
                        isSelected={layout.multiline === true}
                        isDisabled={isDisabled}
                        onChange={(isSelected) => patch("isMultiline", isSelected)}
                    />
                )}
                {question.kind === "Number" && (
                    <Checkbox
                        label={t("form_editor.decimal")}
                        isSelected={isDecimal}
                        isDisabled={isDisabled}
                        onChange={(isSelected) => patch("isDecimal", isSelected)}
                    />
                )}
                {PERSON_KINDS.includes(question.kind as QuestionKind) && (
                    <Checkbox
                        label={t("form_editor.allows_external_users")}
                        isSelected={question.raw.allowsExternalUsers === true}
                        isDisabled={isDisabled}
                        onChange={(isSelected) => patch("allowsExternalUsers", isSelected)}
                    />
                )}
            </div>

            {CHOICE_KINDS.includes(question.kind as QuestionKind) && (
                <fieldset className="flex flex-col gap-2">
                    <legend className="mb-1 text-sm font-medium text-grey-700">
                        {t("form_editor.choices")}
                    </legend>
                    {question.choices.map((choice) => (
                        <div key={choice.name} className="flex items-center gap-2">
                            <Input
                                aria-label={t("form_editor.choice_text")}
                                value={choice.text.nl}
                                isDisabled={isDisabled}
                                onChange={(next) =>
                                    apply(() =>
                                        updateChoice(
                                            docs,
                                            formPath,
                                            question.name,
                                            choice.name,
                                            next,
                                        ),
                                    )
                                }
                            />
                            <Button
                                intent="ghost"
                                size="square"
                                aria-label={t("form_editor.remove_choice")}
                                disabled={isDisabled}
                                onClick={() =>
                                    apply(() =>
                                        removeChoice(docs, formPath, question.name, choice.name),
                                    )
                                }
                            >
                                <Icon name="trash-line" decorative />
                            </Button>
                        </div>
                    ))}
                    <Button
                        intent="secondary"
                        size="small"
                        className="self-start"
                        disabled={isDisabled}
                        leftIcon={<Icon name="plus-line" size="sm" color="current" decorative />}
                        onClick={() =>
                            apply(() =>
                                addChoice(
                                    docs,
                                    formPath,
                                    question.name,
                                    t("form_editor.new_choice"),
                                ),
                            )
                        }
                    >
                        {t("form_editor.add_choice")}
                    </Button>
                </fieldset>
            )}

            {question.kind === "SingleChoice" && (
                <RadioGroup
                    label={t("form_editor.choice_layout")}
                    description={t("form_editor.choice_layout_hint")}
                    isDisabled={isDisabled}
                    value={layout.type === "Dropdown" ? "Dropdown" : "RadioList"}
                    onChange={(next) =>
                        apply(() =>
                            updateQuestion(docs, formPath, question.name, {layoutType: next}),
                        )
                    }
                >
                    {CHOICE_LAYOUTS.map((type) => (
                        <Radio key={type} value={type}>
                            {t(`form_editor.layout.${type}`)}
                        </Radio>
                    ))}
                </RadioGroup>
            )}

            <Disclosure padding="none" shadow="none" border="none">
                <Disclosure.Header>{t("form_editor.more_options")}</Disclosure.Header>
                <Disclosure.Content padding="none">
                    <div className="pt-2">
                        <Input
                            label={t("form_editor.internal_name")}
                            value={nameDraft ?? question.name}
                            isDisabled={isDisabled}
                            description={t("form_editor.internal_name_warning")}
                            onChange={setNameDraft}
                            onBlur={() => {
                                if (nameDraft !== null && nameDraft !== question.name) {
                                    patch("name", nameDraft);
                                }
                                setNameDraft(null);
                            }}
                        />
                    </div>
                </Disclosure.Content>
            </Disclosure>
        </div>
    );
}
