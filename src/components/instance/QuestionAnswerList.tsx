import {Text} from "@datanose/ui";

import {FileAnswer} from "~/components/instance/FileAnswer";
import {useTranslate} from "~/hooks/useTranslate.ts";
import type {Answer, Question} from "~/store/api/types/submissions.ts";
import {downloadFile} from "~/utils/fileDownload";
import {formatAnswer} from "~/utils/formatAnswer.ts";
import type {QuestionAnswerPair} from "~/utils/submissionUtils.ts";

type Props = {
    questionAnswerPairs: QuestionAnswerPair[];
    noAnswerText?: string;
    instanceId: string;
    submissionId: string;
};

export const QuestionAnswerList = ({
    questionAnswerPairs,
    noAnswerText,
    instanceId,
    submissionId,
}: Props) => {
    const {i18n, l} = useTranslate("workflow");

    return (
        <div className="flex flex-col gap-2">
            {questionAnswerPairs.map(({question, answer}) => {
                const formattedValue =
                    answer != null
                        ? formatAnswer(answer.value, question.type, i18n.language)
                        : noAnswerText;
                const isFileAnswer =
                    question.type === "File" && answer != null && answer.files != null;

                return (
                    <div key={question.name} className="grid grid-cols-2 gap-4">
                        <Text>{l(question.text)}</Text>
                        {isFileAnswer ? (
                            <FileAnswer
                                file={answer.files[0]}
                                formattedValue={formattedValue}
                                questionName={question.name}
                                instanceId={instanceId}
                                submissionId={submissionId}
                            />
                        ) : (
                            <Text className="truncate">{formattedValue}</Text>
                        )}
                    </div>
                );
            })}
        </div>
    );
};
