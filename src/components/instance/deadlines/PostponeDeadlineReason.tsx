import {Select, SelectItem, TextArea} from "@uva-fnwi/datanose-ui";

import {useTranslate} from "~/hooks/useTranslate";
import type {Question} from "~/store/api/types/submissions";

type Props = {
    reasonQuestion: Question;
    explanationQuestion: Question;
    value: {choice: string; explanation: string};
    onChange: (value: {choice: string; explanation: string}) => void;
};

export function PostponeDeadlineReason({
    reasonQuestion,
    explanationQuestion,
    value,
    onChange,
}: Props) {
    const {t, l} = useTranslate("workflow");
    return (
        <>
            <Select
                label={l(reasonQuestion.text)}
                placeholder={t("select")}
                value={value.choice || null}
                onChange={(choice) => onChange({choice: String(choice ?? ""), explanation: ""})}
            >
                {reasonQuestion.choices?.map((choice) => (
                    <SelectItem key={choice.name}>{l(choice.text)}</SelectItem>
                ))}
            </Select>
            {value.choice === "Other" && (
                <div className="mt-4">
                    <TextArea
                        label={l(explanationQuestion.text)}
                        value={value.explanation}
                        onChange={(explanation) => onChange({...value, explanation})}
                    />
                </div>
            )}
        </>
    );
}
