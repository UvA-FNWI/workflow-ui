import {useMemo, useState} from "react";

import {Link, Text} from "@uva-fnwi/datanose-ui";

import {AnswerCell} from "~/components/instance/AnswerCell.tsx";
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
    const {i18n, l, t} = useTranslate("workflow");
    const [isOpen, setIsOpen] = useState(initialIsOpen);
    const [expandedLinks, setExpandedLinks] = useState<Set<string>>(new Set());

    const arrayOfPairs: QuestionAnswerPair[][] = useMemo(
        () =>
            Array.isArray(questionAnswerPairs[0])
                ? (questionAnswerPairs as QuestionAnswerPair[][])
                : [questionAnswerPairs as QuestionAnswerPair[]],
        [questionAnswerPairs],
    );

    // Use the first submission's questions as the row definitions
    const questions = useMemo(() => arrayOfPairs[0] ?? [], [arrayOfPairs]);

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
                if (question.linkedTo) return null;

                const linkedIndices = linkedQuestionsMap.get(question.name) ?? [];
                const isMultiSubmission = arrayOfPairs.length > 1;
                const isExpanded = expandedLinks.has(question.name);

                return (
                    <div key={question.name} className="flex flex-col gap-2">
                        <div className={`grid gap-4 ${colsClass}`}>
                            <Text
                                fontWeight="semibold"
                                className="col-span-2 min-w-0 wrap-break-word"
                            >
                                {l(question.text)}
                                {percentage && ` (${percentage.toLocaleString(i18n.language)}%)`}
                            </Text>
                            {arrayOfPairs.map((submission, submissionIndex) => {
                                return (
                                    <AnswerCell
                                        key={submissionIndex}
                                        question={question}
                                        pair={submission[rowIndex]}
                                        canEdit={canEdit}
                                        noAnswerText={noAnswerText}
                                        instanceId={instanceId}
                                        submissionId={submissionId}
                                    />
                                );
                            })}
                        </div>
                        {linkedIndices.length > 0 && (
                            <>
                                {isMultiSubmission && (
                                    <Link
                                        intent="destructive"
                                        underline
                                        onClick={() => toggleLinkedQuestion(question.name)}
                                    >
                                        {isExpanded
                                            ? t("instance.summary.hide_linked")
                                            : t("instance.summary.show_linked")}
                                    </Link>
                                )}
                                {(isExpanded || !isMultiSubmission) && (
                                    <div className="flex flex-col gap-2 border-l-2 border-grey-300 py-2 pl-4">
                                        {linkedIndices.map((linkedIndex) => {
                                            const {question: lq, percentage: lp} =
                                                questions[linkedIndex];
                                            return (
                                                <div key={lq.name} className="flex flex-col gap-2">
                                                    {lp && (
                                                        <Text fontWeight="semibold">
                                                            {lq.text && `${l(lq.text)} `}
                                                            {`(${lp.toLocaleString(i18n.language)}%)`}
                                                        </Text>
                                                    )}
                                                    {arrayOfPairs.map(
                                                        (submission, submissionIndex) => (
                                                            <AnswerCell
                                                                key={submissionIndex}
                                                                question={lq}
                                                                pair={submission[linkedIndex]}
                                                                canEdit={canEdit}
                                                                noAnswerText={noAnswerText}
                                                                instanceId={instanceId}
                                                                submissionId={submissionId}
                                                                showLinkedTitle={
                                                                    arrayOfPairs.length > 1
                                                                }
                                                            />
                                                        ),
                                                    )}
                                                </div>
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
