import {Text} from "@uva-fnwi/datanose-ui";

import {AnswerCell} from "~/components/instance/AnswerCell.tsx";
import {useTranslate} from "~/hooks/useTranslate.ts";
import type {QuestionAnswerPair} from "~/utils/submissionUtils.ts";

type Props = {
    questionAnswerPairs: QuestionAnswerPair[];
    instanceId: string;
    submissionId?: string;
    canEdit?: boolean;
};

export const QuestionAnswerList = ({
    questionAnswerPairs,
    instanceId,
    submissionId,
    canEdit = false,
}: Props) => {
    const {t, l, i18n} = useTranslate("workflow");

    return (
        <div className="flex flex-col gap-2">
            {questionAnswerPairs.map((pair) => {
                const {question, percentage} = pair;

                return (
                    <div key={question.name} className="grid grid-cols-2 gap-4">
                        <Text
                            fontWeight="semibold"
                            className="min-w-0 wrap-break-word"
                            color="text-grey-900"
                        >
                            {l(question.text)}
                            {percentage && ` (${percentage.toLocaleString(i18n.language)}%)`}
                            {":"}
                        </Text>

                        <AnswerCell
                            question={question}
                            pair={pair}
                            canEdit={canEdit}
                            submissionId={submissionId}
                            instanceId={instanceId}
                            noAnswerText={t("version_card.no_answer")}
                        />
                    </div>
                );
            })}
        </div>
    );
};
