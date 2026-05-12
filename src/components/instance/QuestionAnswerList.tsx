import {useState} from "react";

import {Link, Text} from "@uva-fnwi/datanose-ui";

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
};

export const QuestionAnswerList = ({
    questionAnswerPairs,
    noAnswerText,
    instanceId,
    submissionId,
    isOpen: initialIsOpen = false,
    colsClass = "grid-cols-2",
    collapseAnswers = false,
}: Props) => {
    const {i18n, l, t} = useTranslate("workflow");
    const [isOpen, setIsOpen] = useState(initialIsOpen);

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
            {questions.map(({question, percentage}, rowIndex) => (
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
                                ? formatAnswer(answer.value, question.type, i18n.language)
                                : noAnswerText;

                        return question.type === "File" && answer != null ? (
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
                            <Text key={submissionIndex} className="truncate">
                                {formattedValue ? formattedValue : "-"}
                            </Text>
                        );
                    })}
                </div>
            ))}
            {collapseAnswers && (
                <Link intent="destructive" underline onClick={() => setIsOpen(false)}>
                    {t("instance.summary.hide_answers")}
                </Link>
            )}
        </div>
    );
};
