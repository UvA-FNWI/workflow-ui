import {useState} from "react";

import {Button, Icon, Link, Text} from "@uva-fnwi/datanose-ui";

import {InlineQuestionEdit} from "~/components/instance/InlineQuestionEdit.tsx";
import {useTranslate} from "~/hooks/useTranslate.ts";
import {downloadFile} from "~/utils/fileDownload.ts";
import {formatAnswer} from "~/utils/formatAnswer.ts";
import type {QuestionAnswerPair} from "~/utils/submissionUtils.ts";

type Props = {
    questionAnswerPairs: QuestionAnswerPair[];
    noAnswerText?: string;
    instanceId: string;
    submissionId?: string;
    isOpen?: boolean;
    collapseAnswers?: boolean;
    canEdit?: boolean;
};

export const QuestionAnswerList = ({
    questionAnswerPairs,
    noAnswerText,
    instanceId,
    submissionId,
    isOpen: initialIsOpen = false,
    collapseAnswers = false,
    canEdit = false,
}: Props) => {
    const {t, l, i18n} = useTranslate("workflow");
    const [isOpen, setIsOpen] = useState(initialIsOpen);
    const [editingQuestion, setEditingQuestion] = useState<string>("");

    if (collapseAnswers && !isOpen) {
        return (
            <Link intent="destructive" underline onClick={() => setIsOpen(true)}>
                {t("instance.summary.show_answers")}
            </Link>
        );
    }
    return (
        <div className="flex flex-col gap-2">
            {collapseAnswers && (
                <Link intent="destructive" underline onClick={() => setIsOpen(false)}>
                    {t("instance.summary.hide_answers")}
                </Link>
            )}
            {questionAnswerPairs.map(({question, answer, percentage, submission}, rowIndex) => {
                const formattedValue =
                    answer != null
                        ? formatAnswer(answer.value, question.type, i18n.language, question.choices)
                        : noAnswerText;

                return (
                    <div key={question.name} className="grid grid-cols-2 gap-4">
                        <Text fontWeight="semibold" className="min-w-0 wrap-break-word">
                            {l(question.text)}
                            {percentage && ` (${percentage.toLocaleString(i18n.language)}%)`}
                        </Text>

                        {editingQuestion === question.name && (
                            <InlineQuestionEdit
                                key={rowIndex}
                                question={question}
                                answer={answer}
                                instanceId={instanceId}
                                submissionId={submission?.id ?? submissionId ?? ""}
                                onClose={() => setEditingQuestion("")}
                            />
                        )}

                        {question.type === "File" && answer != null && (
                            <div key={rowIndex} className="min-w-0">
                                {answer.value != null ? (
                                    <Link
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
                                    <Text className="min-w-0 wrap-break-word whitespace-pre-wrap">
                                        {formattedValue ? formattedValue : "-"}
                                    </Text>
                                )}
                            </div>
                        )}
                        {editingQuestion !== question.name && question.type !== "File" && (
                            <div key={rowIndex}>
                                <Text
                                    as="span"
                                    display="inline"
                                    className="wrap-break-word whitespace-pre-wrap"
                                >
                                    {formattedValue ? formattedValue : "-"}
                                </Text>
                                {(canEdit || submission?.permissions.includes("Edit")) && (
                                    <Button
                                        intent="ghost"
                                        size="small"
                                        shape="circular"
                                        className="ui:ml-1 ui:border-0 ui:px-1 ui:align-middle ui:hover:enabled:bg-grey-100 ui:dark:hover:enabled:bg-grey-800"
                                        onClick={() => setEditingQuestion(question.name)}
                                        aria-label={t("instance.summary.edit_answer")}
                                    >
                                        <Icon name="edit-line" size="xs" color="danger" />
                                    </Button>
                                )}
                            </div>
                        )}
                    </div>
                );
            })}
        </div>
    );
};
