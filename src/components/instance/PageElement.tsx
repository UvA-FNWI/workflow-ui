import {useCallback} from "react";

import {type Control, Controller, type FieldValues} from "react-hook-form";

import {Callout, type CalloutType, cn, InputLabel, Text} from "@uva-fnwi/datanose-ui";

import {InputControl} from "./InputControl";
import {MarkdownRenderer} from "~/components/MarkdownRenderer.tsx";
import {useTranslate} from "~/hooks/useTranslate";
import {answersApi} from "~/store/api/answersApi";
import type {AnswerInput} from "~/store/api/types/params";
import type {Answer, PageElement as PageElementType} from "~/store/api/types/submissions";

type PageElementProps = {
    instanceId: string;
    submissionId: string;
    element: PageElementType;
    showCompact?: boolean;
    answer?: Answer;
    formControl?: Control<FieldValues>;
};

export const PageElement = ({
    instanceId,
    submissionId,
    element,
    showCompact = false,
    answer,
    formControl,
}: PageElementProps) => {
    const {l, t, i18n} = useTranslate("workflow");

    const [saveAnswer] = answersApi.endpoints.saveAnswer.useMutation();

    const save = useCallback(
        (val: AnswerInput) => saveAnswer({instanceId, submissionId, answer: val}).unwrap(),
        [instanceId, submissionId, saveAnswer],
    );

    switch (element.kind) {
        case "Text":
            if (!element.text) return null;
            return (
                <Text size="lg" as="span">
                    <MarkdownRenderer>{l(element.text)}</MarkdownRenderer>
                </Text>
            );
        case "Callout":
            if (!element.callout || !element.callout.variant) return null;
            return (
                <Callout
                    type={element.callout.variant.toLowerCase() as CalloutType}
                    header={l(element.callout.title)}
                >
                    {element.callout.text && (
                        <MarkdownRenderer>{l(element.callout.text)}</MarkdownRenderer>
                    )}
                </Callout>
            );
        case "Question": {
            if (!element.question || !answer || !formControl || element.question.type == "File")
                return null;
            const question = element.question;
            const errorMessage = answer?.validationError && l(answer.validationError);
            return (
                <Controller
                    key={question.name}
                    control={formControl}
                    name={question.name}
                    render={({field}) => {
                        return (
                            <div
                                className={cn(
                                    showCompact && "flex flex-row items-start justify-between",
                                )}
                            >
                                <div>
                                    <div className="flex justify-between">
                                        {question.type !== "Check" && (
                                            <InputLabel key={question.name}>
                                                {l(question.text)}
                                                {question.percentage != null &&
                                                    ` (${question.percentage.toLocaleString(i18n.language)}%)`}
                                            </InputLabel>
                                        )}
                                        {!question.isRequired && (
                                            <Text className="text-grey-900 italic" size="sm">
                                                {t("optional")}
                                            </Text>
                                        )}
                                    </div>
                                    {question.description && (
                                        <div className="mr-2 mb-1 text-sm text-grey-600 dark:text-grey-400">
                                            <MarkdownRenderer>
                                                {l(question.description)}
                                            </MarkdownRenderer>
                                        </div>
                                    )}
                                </div>
                                <div className={showCompact ? "w-24 shrink-0" : "w-full"}>
                                    <InputControl
                                        instanceId={instanceId}
                                        submissionId={submissionId}
                                        value={field.value}
                                        onChange={field.onChange}
                                        question={question}
                                        onSave={save}
                                        visibleChoices={answer?.visibleChoices}
                                        errorMessage={errorMessage}
                                        isValid={!errorMessage}
                                    />
                                </div>
                            </div>
                        );
                    }}
                />
            );
        }
    }
};
