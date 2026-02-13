import {Button, Icon, Text} from "@datanose/ui";
import type {FetchBaseQueryError} from "@reduxjs/toolkit/query";

import {QuestionAnswerList} from "./QuestionAnswerList.tsx";
import {useTranslate} from "~/hooks/useTranslate.ts";
import {submissionsEndpoints} from "~/store/api/submissionsApi.ts";
import type {SubmitSubmissionResult} from "~/store/api/types/returnTypes.ts";
import type {Submission} from "~/store/api/types/submissions.ts";

type Props = {
    instanceId: string;
    submission: Submission;
    onEditPage?: (index: number) => void;
    onSubmit?: () => void;
};

export const FormSummary = ({instanceId, submission, onEditPage, onSubmit}: Props) => {
    const {t, l} = useTranslate("workflow");

    const [submitSubmission, {isLoading}] = submissionsEndpoints.submitSubmission.useMutation();

    return (
        <div className="flex flex-col gap-6">
            {submission.form.pages.map((page, index) => (
                <div key={index} className="flex flex-col gap-3">
                    {/* Page title with edit button */}
                    <div className="flex items-center gap-1">
                        <Text fontWeight="bold" size="lg">
                            {l(page.title)}
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

            {onSubmit && (
                <div className="mt-4 flex justify-between gap-2">
                    <Button
                        intent="destructivePrimary"
                        className="ml-auto"
                        isLoading={isLoading}
                        onClick={async () => {
                            const res = await submitSubmission({
                                instanceId,
                                submissionId: submission.id,
                            });
                            const errorResult = (res.error as FetchBaseQueryError)
                                ?.data as SubmitSubmissionResult;
                            if (errorResult?.validationErrors.length) {
                                // TODO: validation (DN-3424)
                                const question = errorResult.validationErrors[0];
                                alert(
                                    `Not valid! ${question.questionName}: ${l(question.validationMessage)}`,
                                );
                                return;
                            }
                            onSubmit();
                        }}
                    >
                        {t("submit")}
                    </Button>
                </div>
            )}
        </div>
    );
};
