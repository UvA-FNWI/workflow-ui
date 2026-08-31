import {useState} from "react";

import {Icon, InputDescription, InputLabel} from "@uva-fnwi/datanose-ui";

import {
    type ConfigDocs,
    type EditorQuestion,
    toPreviewQuestion,
} from "~/components/FormEditor/model";
import {InputControl} from "~/components/instance/InputControl";
import {useTranslate} from "~/hooks/useTranslate";

/**
 * The question rendered by the same control the runtime uses, so "what will this look like" needs no
 * round trip to the server. Answers go nowhere: InputControl only saves when given an onSave.
 */
export function QuestionPreview({docs, question}: {docs: ConfigDocs; question: EditorQuestion}) {
    const {t, l} = useTranslate("form_editor");
    const [value, setValue] = useState<unknown>(undefined);
    const preview = toPreviewQuestion(docs, question);
    const label = l(question.text) || question.name;
    const description = l(question.description);

    return (
        <div className="bg-grey-50 rounded-xs border border-dashed border-grey-300 p-3 dark:border-grey-600 dark:bg-grey-800">
            <p className="mb-2 flex items-center gap-1 text-xs font-medium tracking-wide text-grey-500 uppercase">
                <Icon name="visible-line" size="xs" decorative />
                {t("preview_label")}
            </p>
            <InputLabel>
                {label}
                {question.isRequired && <span aria-hidden="true"> *</span>}
            </InputLabel>
            {description && <InputDescription className="mb-2">{description}</InputDescription>}
            {preview === null ? (
                <p className="mt-1 text-sm text-grey-500 italic">
                    {t("preview_unavailable", {type: question.rawType || "?"})}
                </p>
            ) : (
                <div className="mt-1">
                    <InputControl question={preview} value={value} onChange={setValue} />
                </div>
            )}
        </div>
    );
}
