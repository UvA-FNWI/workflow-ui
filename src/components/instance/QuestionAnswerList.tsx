import {useState} from "react";

import {Button, Icon, Link, Text} from "@uva-fnwi/datanose-ui";

import {InlineQuestionEdit} from "./InlineQuestionEdit.tsx";
import {useTranslate} from "~/hooks/useTranslate.ts";
import {downloadFile} from "~/utils/fileDownload";
import {formatAnswer} from "~/utils/formatAnswer.ts";
import type {QuestionAnswerPair} from "~/utils/submissionUtils.ts";

type Props = {
    questionAnswerPairs: QuestionAnswerPair[] | QuestionAnswerPair[][];
    noAnswerText?: string;
    instanceId: string;
    submissionId: string;
    isOpen?: boolean;
    colsClass?: string;
    collapseAnswers?: boolean;
    canEdit?: boolean;
};

export const QuestionAnswerList = ({
    questionAnswerPairs,
    noAnswerText,
    instanceId,
    submissionId,
    isOpen: initialIsOpen = false,
    colsClass = "grid-cols-2",
    collapseAnswers = false,
    canEdit = false,
}: Props) => {
    const {i18n, l, t} = useTranslate("workflow");
    const [isOpen, setIsOpen] = useState(initialIsOpen);
    const [editingQuestionName, setEditingQuestionName] = useState<string | null>(null);

    if (collapseAnswers && !isOpen) {
        return (
            <Link intent="destructive" underline onClick={() => setIsOpen(true)}>
                {t("instance.summary.show_answers")}
            </Link>
        );
    }

    const arrayOfPairs: QuestionAnswerPair[][] = Array.isArray(questionAnswerPairs[0])
        ? (questionAnswerPairs as QuestionAnswerPair[][])
        : [questionAnswerPairs as QuestionAnswerPair[]];

    // Use the first submission's questions as the row definitions
    const questions = arrayOfPairs[0] ?? [];

    return (
        <div className="flex flex-col gap-2">
            {questions.map(({question, percentage}, rowIndex) => {
                const isEditing = canEdit && editingQuestionName === question.name;
                const pair = questions[rowIndex];

                if (isEditing) {
                    return (
                        <div key={question.name} className={`grid gap-4 ${colsClass}`}>
                            <Text>
                                {l(question.text)}
                                {percentage && ` (${percentage.toLocaleString(i18n.language)}%)`}
                            </Text>
                            <InlineQuestionEdit
                                question={question}
                                answer={pair.answer}
                                instanceId={instanceId}
                                submissionId={submissionId}
                                onClose={() => setEditingQuestionName(null)}
                            />
                        </div>
                    );
                }

                return (
                    <div key={question.name} className={`grid gap-4 ${colsClass}`}>
                        <Text>
                            {l(question.text)}
                            {percentage && ` (${percentage.toLocaleString(i18n.language)}%)`}
                        </Text>

                        {arrayOfPairs.map((submission, submissionIndex) => {
                            const pair = submission[rowIndex];
                            const {answer} = pair;
                            const formattedValue =
                                answer != null
                                    ? formatAnswer(
                                          answer.value,
                                          question.type,
                                          i18n.language,
                                          question.choices,
                                      )
                                    : noAnswerText;

                            return question.type === "File" && answer != null ? (
                                answer.value != null ? (
                                    <Link
                                        key={submissionIndex}
                                        intent="primary"
                                        underline
                                        className="truncate"
                                        onClick={() =>
                                            downloadFile(
                                                answer.files[0],
                                                question.name,
                                                instanceId,
                                                submissionId,
                                            )
                                        }
                                    >
                                        {formattedValue}
                                    </Link>
                                ) : (
                                    <Text className="truncate" key={submissionIndex}>
                                        {formattedValue ? formattedValue : "-"}
                                    </Text>
                                )
                            ) : (
                                <div key={submissionIndex} className="flex items-center gap-2">
                                    <Text className="truncate">
                                        {formattedValue ? formattedValue : "-"}
                                    </Text>
                                    {canEdit && (
                                        <Button
                                            intent="ghost"
                                            size="small"
                                            shape="circular"
                                            className="ui:border-0 ui:px-1 ui:hover:enabled:bg-grey-100 ui:dark:hover:enabled:bg-grey-800"
                                            onClick={() => setEditingQuestionName(question.name)}
                                            aria-label={t("instance.summary.edit_answer")}
                                        >
                                            <Icon name="edit-line" size="xs" color="danger" />
                                        </Button>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                );
            })}
            {collapseAnswers && (
                <Link intent="destructive" underline onClick={() => setIsOpen(false)}>
                    {t("instance.summary.hide_answers")}
                </Link>
            )}
        </div>
    );
};
