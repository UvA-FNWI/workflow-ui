import {Select, SelectItem} from "@uva-fnwi/datanose-ui";

import {useTranslate} from "~/hooks/useTranslate";
import {answersApi} from "~/store/api/answersApi";
import type {Question} from "~/store/api/types/submissions";

interface ReferenceControlProps {
    instanceId: string;
    submissionId: string;
    value?: unknown;
    question: Question;
    onChange: (val: unknown) => void;
    isValid?: boolean;
    errorMessage?: string;
}

export const ReferenceControl = ({
    instanceId,
    submissionId,
    value,
    question,
    onChange,
    isValid,
    errorMessage,
}: ReferenceControlProps) => {
    const {t, l} = useTranslate("workflow");

    const {data: choices} = answersApi.useGetChoicesQuery(
        {
            instanceId,
            submissionId,
            questionName: question.name,
        },
        {skip: !instanceId || !submissionId},
    );

    if (question.isArray) {
        const selectedValues = Array.isArray(value) ? value.map((v) => String(v)) : [];
        return (
            <Select
                selectionMode="multiple"
                value={selectedValues}
                onChange={(selectedValue) => {
                    const normalizedValues = Array.isArray(selectedValue)
                        ? selectedValue.map((v) => String(v))
                        : selectedValue != null
                          ? [String(selectedValue)]
                          : [];
                    onChange(normalizedValues);
                }}
                placeholder={t("select")}
                isValid={isValid}
                errorMessage={errorMessage}
            >
                {(choices ?? []).map((choice) => (
                    <SelectItem key={choice.name}>{l(choice.text) ?? choice.name}</SelectItem>
                ))}
            </Select>
        );
    }

    return (
        <Select
            value={typeof value === "string" ? value : null}
            onChange={(selectedValue) => {
                onChange(selectedValue != null ? String(selectedValue) : null);
            }}
            placeholder={t("select")}
            isValid={isValid}
            errorMessage={errorMessage}
        >
            {(choices ?? []).map((choice) => (
                <SelectItem key={choice.name}>{l(choice.text) ?? choice.name}</SelectItem>
            ))}
        </Select>
    );
};
