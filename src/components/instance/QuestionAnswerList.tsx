import {Text} from "@datanose/ui";

import {useTranslate} from "~/hooks/useTranslate.ts";
import type {Question} from "~/store/api/types/submissions.ts";
import {formatAnswer} from "~/utils/formatAnswer.ts";

type QuestionAnswerPair = {
    question: Question;
    value: unknown;
};

type Props = {
    questionAnswerPairs: QuestionAnswerPair[];
    noAnswerText?: string;
};

export const QuestionAnswerList = ({questionAnswerPairs, noAnswerText}: Props) => {
    const {i18n, l} = useTranslate("workflow");

    return (
        <div className="flex flex-col gap-2">
            {questionAnswerPairs.map(({question, value}) => {
                const formattedValue =
                    value != null
                        ? formatAnswer(value, question.type, i18n.language)
                        : noAnswerText;

                return (
                    <div key={question.name} className="grid grid-cols-2 gap-4">
                        <Text>{l(question.text)}</Text>
                        <Text>{formattedValue}</Text>
                    </div>
                );
            })}
        </div>
    );
};
