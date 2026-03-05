import {Button, Icon, Text} from "@datanose/ui";

import {QuestionAnswerList} from "./QuestionAnswerList.tsx";
import {FormSubmitButton} from "~/components/instance/FormSubmitButton.tsx";
import {useTranslate} from "~/hooks/useTranslate.ts";
import type {Submission} from "~/store/api/types/submissions.ts";

type Props = {
    instanceId: string;
    submission: Submission;
    onEditPage?: (index: number) => void;
    onSubmit?: () => void;
};

export const FormSummary = ({instanceId, submission, onEditPage, onSubmit}: Props) => {
    const {t, l} = useTranslate("workflow");

    return (
        <div className="flex flex-col gap-6">
            {submission.form.pages.map((page, index) => (
                <div key={index} className="flex flex-col gap-3">
                    {/* Page title with edit button */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="flex items-center gap-1">
                            <Text fontWeight="bold" size="lg">
                                {l(page.title)}
                                {page.weight > 0 && ` (${page.weight}%)`}
                            </Text>
                            {onEditPage && (
                                <Button
                                    intent="ghost"
                                    size="small"
                                    shape="circular"
                                    className="ui:border-0 ui:hover:enabled:bg-grey-100 ui:dark:hover:enabled:bg-grey-800"
                                    onClick={() => onEditPage(index)}
                                    rightIcon={<Icon name="edit-line" size="xs" color="danger" />}
                                    aria-label={t("instance.summary.edit_page", {
                                        pageTitle: l(page.title),
                                    })}
                                ></Button>
                            )}
                        </div>
                        <div>
                            {submission.averageResults[page.title.en] && (
                                <Text fontWeight="bold" size="lg">
                                    {submission.averageResults[page.title.en].toFixed(2)}
                                </Text>
                            )}
                        </div>
                    </div>
                    {/* Questions and answers */}
                    <QuestionAnswerList
                        questionAnswerPairs={page.questions.map((question) => {
                            const answer = submission.answers.find(
                                (a) => a.questionName === question.name,
                            );
                            return {
                                question,
                                answer: answer ?? null,
                            };
                        })}
                        noAnswerText={t("instance.summary.no_answer")}
                        instanceId={instanceId}
                        submissionId={submission.id}
                    />
                </div>
            ))}
            {submission.averageResults["total"] && (
                <div className="grid grid-cols-2 gap-4">
                    <Text fontWeight="bold" size="lg">
                        Eindcijfer:
                    </Text>
                    <Text fontWeight="bold" size="lg">
                        {submission.averageResults["total"].toFixed(2)}
                    </Text>
                </div>
            )}

            {onSubmit && (
                <FormSubmitButton
                    instanceId={instanceId}
                    submission={submission}
                    onSubmit={onSubmit}
                />
            )}
        </div>
    );
};
