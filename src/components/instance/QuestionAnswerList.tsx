import {useState} from "react";

import {Button, Icon, Text} from "@uva-fnwi/datanose-ui";

import {AnswerCell} from "~/components/instance/AnswerCell.tsx";
import {AnswerChangesModal} from "~/components/instance/AnswerChangesModal.tsx";
import {useTranslate} from "~/hooks/useTranslate.ts";
import {formatDateShort} from "~/utils/formatDate.ts";
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
    const [historyPair, setHistoryPair] = useState<QuestionAnswerPair | null>(null);

    return (
        <div className="flex flex-col gap-2">
            {questionAnswerPairs.map((pair) => {
                const {question, percentage} = pair;
                const latestEdit = pair.answer?.changes?.find((group) => group.changes.length > 1)
                    ?.changes[0];

                return (
                    <div key={question.name} className="grid grid-cols-2 gap-4">
                        <div className="flex min-w-0 items-start">
                            <Text
                                as="span"
                                fontWeight="semibold"
                                className="min-w-0 wrap-break-word"
                                color="text-grey-900"
                            >
                                {l(question.text)}
                                {percentage && ` (${percentage.toLocaleString(i18n.language)}%)`}
                                {":"}
                            </Text>
                            {latestEdit && (
                                <Button
                                    intent="ghost"
                                    size="small"
                                    shape="circular"
                                    className="ui:ml-1 ui:border-0 ui:px-1 ui:align-middle ui:hover:enabled:bg-grey-100 ui:dark:hover:enabled:bg-grey-800"
                                    onClick={() => setHistoryPair(pair)}
                                    aria-label={t("instance.summary.view_changes")}
                                >
                                    <Icon name="clock-back-line" size="xs" color="danger" />
                                </Button>
                            )}
                        </div>

                        <div className="flex min-w-0 flex-wrap items-baseline gap-1">
                            <AnswerCell
                                pair={pair}
                                canEdit={canEdit}
                                submissionId={submissionId}
                                instanceId={instanceId}
                                noAnswerText={t("version_card.no_answer")}
                            />
                            {latestEdit && (
                                <button
                                    type="button"
                                    className="cursor-pointer"
                                    onClick={() => setHistoryPair(pair)}
                                    aria-label={t("instance.summary.view_changes")}
                                >
                                    <Text intent="secondary" display="inline">
                                        (
                                        {t("instance.summary.changed_on_inline", {
                                            date: formatDateShort(
                                                latestEdit.changedAt,
                                                i18n.language,
                                            ),
                                        })}
                                        )
                                    </Text>
                                </button>
                            )}
                        </div>
                    </div>
                );
            })}
            {historyPair?.answer?.changes && (
                <AnswerChangesModal
                    isOpen
                    onClose={() => setHistoryPair(null)}
                    question={historyPair.question}
                    changes={historyPair.answer.changes}
                />
            )}
        </div>
    );
};
