import {useState} from "react";

import {InputDescription, InputLabel, Text} from "@uva-fnwi/datanose-ui";

import {FormElementPreview} from "~/components/FormEditor/FormElementCard";
import {
    type ConfigDocs,
    type EditorQuestion,
    toPreviewQuestion,
} from "~/components/FormEditor/model";
import {InputControl} from "~/components/instance/InputControl";
import {useTranslate} from "~/hooks/useTranslate";
import type {Question} from "~/store/api/types/submissions";

/**
 * The question rendered by the same control the runtime uses, so "what will this look like" needs no
 * round trip to the server. Answers go nowhere: InputControl only saves when given an onSave.
 */
export function QuestionPreview({
    docs,
    question,
    localPreview,
}: {
    docs: ConfigDocs;
    question: EditorQuestion;
    localPreview?: boolean;
}) {
    const {t, l} = useTranslate("form_editor");
    const preview = toPreviewQuestion(docs, question);
    const label = l(question.text) || question.name;
    const description = l(question.description);

    return (
        <FormElementPreview>
            <div className="flex gap-1">
                <InputLabel>{label}</InputLabel>
                {!question.isRequired && (
                    <Text className="text-grey-900 italic">{t("optional", {ns: "workflow"})}</Text>
                )}
            </div>
            {description && <InputDescription className="mb-2">{description}</InputDescription>}
            <QuestionInputPreview
                question={localPreview && preview?.type === "User" ? null : preview}
                rawType={question.rawType}
            />
        </FormElementPreview>
    );
}

export function QuestionInputPreview({
    question,
    rawType,
}: {
    question: Question | null;
    rawType: string;
}) {
    const {t, l} = useTranslate("form_editor");
    const [value, setValue] = useState<unknown>();
    return question ? (
        <div className="mt-1">
            <InputControl
                question={question}
                value={value}
                onChange={setValue}
                ariaLabel={l(question.text) || question.name}
            />
        </div>
    ) : (
        <p className="mt-1 text-sm text-grey-500 italic">
            {t("preview_unavailable", {type: rawType || "?"})}
        </p>
    );
}
