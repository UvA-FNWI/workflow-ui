import {type Control, Controller, type FieldValues} from "react-hook-form";

import {Callout, type CalloutType, cn, InputLabel, Text} from "@uva-fnwi/datanose-ui";

import {InputControl} from "./InputControl";
import {MarkdownRenderer} from "~/components/MarkdownRenderer.tsx";
import {useTranslate} from "~/hooks/useTranslate";
import type {AnswerInput} from "~/store/api/types/params";
import type {SaveAnswerResult} from "~/store/api/types/returnTypes";
import type {Answer, PageElement as PageElementType} from "~/store/api/types/submissions";

type PageElementProps = {
    instanceId: string;
    submissionId: string;
    element: PageElementType;
    showCompact?: boolean;
    answer?: Answer;
    formControl?: Control<FieldValues>;
    showPercentages?: boolean;
    onChange: (questionName: string, value: unknown) => void;
    onSave: (answer: AnswerInput) => Promise<SaveAnswerResult>;
};

export const PageElement = ({
    instanceId,
    submissionId,
    element,
    showCompact = false,
    answer,
    formControl,
    showPercentages = false,
    onChange,
    onSave,
}: PageElementProps) => {
    const {l, t, i18n} = useTranslate("workflow");

    switch (element.kind) {
        case "Text":
            if (!element.text) return null;
            return (
                <div className="flex flex-col gap-2">
                    <MarkdownRenderer>{l(element.text)}</MarkdownRenderer>
                </div>
            );
        case "Callout":
            if (!element.callout || !element.callout.variant) return null;
            return (
                <Callout
                    type={element.callout.variant.toLowerCase() as CalloutType}
                    header={l(element.callout.title)}
                >
                    {element.callout.text && (
                        <MarkdownRenderer className="leading-tight">
                            {l(element.callout.text)}
                        </MarkdownRenderer>
                    )}
                </Callout>
            );
        case "Question": {
            if (
                !element.question ||
                !answer ||
                !formControl ||
                element.question.type == "File" ||
                !answer.isVisible
            )
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
                                                    showPercentages &&
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
                                <div className={showCompact ? "min-w-24 shrink-0" : "w-full"}>
                                    <InputControl
                                        instanceId={instanceId}
                                        submissionId={submissionId}
                                        value={field.value}
                                        onChange={(value) => {
                                            onChange(question.name, value);
                                            field.onChange(value);
                                        }}
                                        question={question}
                                        onSave={onSave}
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
