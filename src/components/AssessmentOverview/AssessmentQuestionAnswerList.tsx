import {useMemo, useState} from "react";

import {Link} from "@uva-fnwi/datanose-ui";

import {QuestionAnswerRow} from "~/components/AssessmentOverview/QuestionAnswerRow.tsx";
import {useTranslate} from "~/hooks/useTranslate.ts";
import type {QuestionAnswerPair} from "~/utils/submissionUtils.ts";

type Props = {
    questionAnswerPairs: QuestionAnswerPair[] | QuestionAnswerPair[][];
    noAnswerText?: string;
    instanceId: string;
    submissionId?: string;
    isOpen?: boolean;
    colsClass?: string;
    collapseAnswers?: boolean;
    canEdit?: boolean;
};

export const AssessmentQuestionAnswerList = ({
    questionAnswerPairs,
    noAnswerText,
    instanceId,
    submissionId,
    isOpen: initialIsOpen = false,
    colsClass = "grid-cols-3",
    collapseAnswers = false,
    canEdit = false,
}: Props) => {
    const {t} = useTranslate("workflow");
    const [isOpen, setIsOpen] = useState(initialIsOpen);
    const [expandedLinks, setExpandedLinks] = useState<Set<string>>(new Set());

    const arrayOfPairs: QuestionAnswerPair[][] = Array.isArray(questionAnswerPairs[0])
        ? (questionAnswerPairs as QuestionAnswerPair[][])
        : [questionAnswerPairs as QuestionAnswerPair[]];

    // Use the first submission's questions as the row definitions
    const questions = arrayOfPairs[0] ?? [];

    const linkedQuestionsMap = useMemo(() => {
        const map = new Map<string, number[]>();
        questions.forEach(({question}, index) => {
            if (question.linkedTo) {
                const existing = map.get(question.linkedTo) ?? [];
                map.set(question.linkedTo, [...existing, index]);
            }
        });
        return map;
    }, [questions]);

    const toggleLinkedQuestion = (questionName: string) => {
        setExpandedLinks((prev) => {
            const next = new Set(prev);
            if (next.has(questionName)) {
                next.delete(questionName);
            } else {
                next.add(questionName);
            }
            return next;
        });
    };

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
                <Link
                    intent="destructive"
                    underline
                    onClick={() => {
                        setIsOpen(false);
                        setExpandedLinks(new Set());
                    }}
                >
                    {t("instance.summary.hide_answers")}
                </Link>
            )}
            {questions.map(({question, percentage}, rowIndex) => {
                const linkedIndices = linkedQuestionsMap.get(question.name) ?? [];
                const isExpanded = expandedLinks.has(question.name);

                if (question.linkedTo) return null;

                return (
                    <div key={question.name} className="flex flex-col gap-2">
                        <QuestionAnswerRow
                            question={question}
                            percentage={percentage}
                            colsClass={colsClass}
                            rowIndex={rowIndex}
                            canEdit={canEdit}
                            arrayOfPairs={arrayOfPairs}
                            noAnswerText={noAnswerText}
                            instanceId={instanceId}
                            submissionId={submissionId}
                        />
                        {linkedIndices.length > 0 && (
                            <>
                                <Link
                                    intent="destructive"
                                    underline
                                    onClick={() => toggleLinkedQuestion(question.name)}
                                >
                                    {isExpanded
                                        ? t("instance.summary.hide_linked")
                                        : t("instance.summary.show_linked")}
                                </Link>
                                {isExpanded && (
                                    <div className="flex flex-col gap-2 border-l-2 border-grey-300 py-2 pl-4">
                                        {linkedIndices.map((linkedIndex) => {
                                            const {question: lq, percentage: lp} =
                                                questions[linkedIndex];
                                            return (
                                                <QuestionAnswerRow
                                                    key={lq.name}
                                                    question={lq}
                                                    percentage={lp}
                                                    colsClass="grid-cols-1"
                                                    rowIndex={linkedIndex}
                                                    canEdit={canEdit}
                                                    arrayOfPairs={arrayOfPairs}
                                                    noAnswerText={noAnswerText}
                                                    instanceId={instanceId}
                                                    submissionId={submissionId}
                                                    isLinkedRow={true}
                                                />
                                            );
                                        })}
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                );
            })}
        </div>
    );
};
