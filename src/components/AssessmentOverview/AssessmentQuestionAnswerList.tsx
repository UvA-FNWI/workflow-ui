import {useMemo, useState} from "react";

import {Link, Text} from "@uva-fnwi/datanose-ui";

import {AssessmentResultCell} from "~/components/AssessmentOverview/AssessmentResultCell.tsx";
import {AnswerCell} from "~/components/instance/AnswerCell.tsx";
import {FieldMessageBalloon} from "~/components/instance/FieldMessageBalloon.tsx";
import {type MessageUiSettings} from "~/components/instance/instanceMessageSettings.ts";
import {useTranslate} from "~/hooks/useTranslate.ts";
import type {QuestionAnswerPair} from "~/utils/submissionUtils.ts";

type Props = {
    rows: QuestionAnswerPair[];
    questionAnswerPairs: QuestionAnswerPair[][];
    instanceId: string;
    submissionId?: string;
    isOpen?: boolean;
    colsClass?: string;
    collapseAnswers?: boolean;
    canEdit?: boolean;
    showMessages?: boolean;
    messageUi?: MessageUiSettings;
};

export const AssessmentQuestionAnswerList = ({
    rows: questions,
    questionAnswerPairs: arrayOfPairs,
    instanceId,
    submissionId,
    isOpen: initialIsOpen = false,
    colsClass = "grid-cols-3",
    collapseAnswers = false,
    canEdit = false,
    showMessages = true,
    messageUi,
}: Props) => {
    const {i18n, l, t} = useTranslate("workflow");
    const [isOpen, setIsOpen] = useState(initialIsOpen);
    const [expandedLinks, setExpandedLinks] = useState<Set<string>>(new Set());

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
                    className="w-48 sm:w-80"
                >
                    {t("instance.summary.hide_answers")}
                </Link>
            )}
            {questions.map(({question, percentage}) => {
                if (question.linkedTo) return null;

                const linkedIndices = linkedQuestionsMap.get(question.name) ?? [];
                const isMultiSubmission = arrayOfPairs.length > 1;
                const isExpanded = expandedLinks.has(question.name);

                return (
                    <div key={question.name} className="flex flex-col gap-2">
                        <div className={`grid gap-4 ${colsClass}`}>
                            <div className="col-span-2 flex w-48 min-w-0 items-start sm:w-80">
                                <Text
                                    as="span"
                                    fontWeight="semibold"
                                    className="min-w-0 wrap-break-word"
                                >
                                    {l(question.text)}
                                    {percentage &&
                                        ` (${percentage.toLocaleString(i18n.language)}%)`}
                                </Text>
                            </div>
                            {arrayOfPairs.map((submission, submissionIndex) => {
                                const pair = submission.find(
                                    (s) => s.question.name === question.name,
                                );
                                const messages = pair?.answer?.messages;
                                return (
                                    <AssessmentResultCell
                                        key={submissionIndex}
                                        showMessageColumn={showMessages}
                                        messageButton={
                                            messages && (
                                                <FieldMessageBalloon
                                                    {...messages}
                                                    fieldLabel={l(question.text) ?? question.name}
                                                    messageUi={messageUi}
                                                />
                                            )
                                        }
                                    >
                                        <AnswerCell
                                            pair={pair}
                                            canEdit={canEdit}
                                            noAnswerText="-"
                                            instanceId={instanceId}
                                            submissionId={submissionId}
                                        />
                                    </AssessmentResultCell>
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
                                        className="w-48 sm:w-80"
                                    >
                                        {isExpanded
                                            ? t("instance.summary.hide_linked")
                                            : t("instance.summary.show_linked")}
                                    </Link>
                                )}
                                {(isExpanded || !isMultiSubmission) && (
                                    <div className="flex flex-col gap-2 border-l-2 border-grey-300 py-2 pl-4 contain-[inline-size]">
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
                                                        (submission, submissionIndex) => {
                                                            const pair = submission.find(
                                                                (s) => s.question.name === lq.name,
                                                            );
                                                            const messages = pair?.answer?.messages;
                                                            return (
                                                                <div
                                                                    key={submissionIndex}
                                                                    className="flex min-w-0 items-start gap-1"
                                                                >
                                                                    {showMessages && messages && (
                                                                        <FieldMessageBalloon
                                                                            {...messages}
                                                                            fieldLabel={
                                                                                l(lq.text) ??
                                                                                lq.name
                                                                            }
                                                                            messageUi={messageUi}
                                                                        />
                                                                    )}
                                                                    <div className="min-w-0 flex-1">
                                                                        <AnswerCell
                                                                            pair={pair}
                                                                            canEdit={canEdit}
                                                                            noAnswerText="-"
                                                                            instanceId={instanceId}
                                                                            submissionId={
                                                                                submissionId
                                                                            }
                                                                            showLinkedTitle={
                                                                                isMultiSubmission
                                                                            }
                                                                        />
                                                                    </div>
                                                                </div>
                                                            );
                                                        },
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
