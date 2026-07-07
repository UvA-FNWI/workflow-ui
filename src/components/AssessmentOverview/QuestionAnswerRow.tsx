import {useState} from "react";

import {Button, Icon, Link, Text} from "@uva-fnwi/datanose-ui";

import {InlineQuestionEdit} from "~/components/instance/InlineQuestionEdit.tsx";
import {useTranslate} from "~/hooks/useTranslate.ts";
import type {Question} from "~/store/api/types/submissions.ts";
import {downloadFile} from "~/utils/fileDownload.ts";
import {formatAnswer} from "~/utils/formatAnswer.ts";
import type {QuestionAnswerPair} from "~/utils/submissionUtils.ts";

type Props = {
    question: Question;
    percentage: number | null;
    colsClass?: string;
    rowIndex: number;
    canEdit?: boolean;
    arrayOfPairs: QuestionAnswerPair[][];
    noAnswerText?: string;
    instanceId: string;
    submissionId?: string;
    isLinkedRow?: boolean;
};

type EditTarget = {
    submissionIndex: number;
    question: string;
};

export const QuestionAnswerRow = ({
    question,
    percentage,
    colsClass,
    rowIndex,
    canEdit,
    arrayOfPairs,
    noAnswerText,
    instanceId,
    submissionId,
    isLinkedRow = false,
}: Props) => {
    const {i18n, l, t} = useTranslate("workflow");
    const [editingQuestion, setEditingQuestion] = useState<EditTarget | null>(null);
    const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

    return (
        <div key={question.name} className={`grid gap-4 ${colsClass}`}>
            {!isLinkedRow && (
                <Text fontWeight="semibold" className="col-span-2 min-w-0 wrap-break-word">
                    {l(question.text)}
                    {percentage && ` (${percentage.toLocaleString(i18n.language)}%)`}
                </Text>
            )}

            {arrayOfPairs.map((submission, submissionIndex) => {
                const pair = submission[rowIndex];
                if (!pair) return <span key={submissionIndex}></span>;
                const {answer} = pair;
                const formattedValue =
                    answer != null
                        ? formatAnswer(answer.value, question.type, i18n.language, question.choices)
                        : noAnswerText;

                const answerTitleText = pair.columnTitle ?? pair?.submission?.form?.title;

                if (
                    editingQuestion?.question === question.name &&
                    editingQuestion?.submissionIndex === submissionIndex
                ) {
                    return (
                        <InlineQuestionEdit
                            key={submissionIndex}
                            question={question}
                            answer={answer}
                            instanceId={instanceId}
                            submissionId={pair.submission?.id ?? submissionId ?? ""}
                            onClose={() => setEditingQuestion(null)}
                        />
                    );
                }

                if (question.type === "File" && answer != null) {
                    return (
                        <div key={submissionIndex} className="min-w-0">
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
                    );
                }

                return (
                    <div key={submissionIndex} className="flex min-w-0 flex-col">
                        {isLinkedRow && (
                            <div>
                                <Text fontWeight="semibold" className="mb-1">
                                    {t("instance.summary.explanation")}
                                    {answerTitleText && ` ${l(answerTitleText)}`}
                                </Text>
                                <Button
                                    intent="ghost"
                                    size="small"
                                    shape="circular"
                                    className="border-0 px-1 align-top"
                                    onClick={() => {
                                        navigator.clipboard.writeText(answer?.value as string);
                                        setCopiedIndex(submissionIndex);
                                        setTimeout(() => setCopiedIndex(null), 2000);
                                    }}
                                >
                                    <Icon
                                        name={
                                            copiedIndex === submissionIndex
                                                ? "checkmark-line"
                                                : "copy-line"
                                        }
                                        size="sm"
                                        color="danger"
                                    />
                                </Button>
                            </div>
                        )}
                        <div>
                            <Text
                                as="span"
                                display="inline"
                                className="wrap-break-word whitespace-pre-wrap"
                            >
                                {formattedValue ? formattedValue : "-"}
                            </Text>
                            {(canEdit || pair.submission?.permissions.includes("Edit")) && (
                                <Button
                                    intent="ghost"
                                    size="small"
                                    shape="circular"
                                    className="ui:ml-1 ui:border-0 ui:px-1 ui:align-middle ui:hover:enabled:bg-grey-100 ui:dark:hover:enabled:bg-grey-800"
                                    onClick={() =>
                                        setEditingQuestion({
                                            submissionIndex,
                                            question: question.name,
                                        })
                                    }
                                    aria-label={t("instance.summary.edit_answer")}
                                >
                                    <Icon name="edit-line" size="xs" color="danger" />
                                </Button>
                            )}
                        </div>
                    </div>
                );
            })}
        </div>
    );
};
