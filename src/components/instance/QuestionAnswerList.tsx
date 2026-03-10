import {Link, Text} from "@datanose/ui";

import {useTranslate} from "~/hooks/useTranslate.ts";
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

                return (
                    <div key={question.name} className="grid grid-cols-2 gap-4">
                        <Text>{l(question.text)}</Text>
                        {question.type === "File" && answer != null ? (
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
                            <Text className="truncate">{formattedValue}</Text>
                        )}
                    </div>
                );
                // return (
                //     <div key={question.name} className="grid grid-cols-2 gap-4">
                //         <Text>{l(question.text)}</Text>
                //         <Text>{formattedValue}</Text>
                //     </div>
                // );
            })}
        </div>
    );
};
