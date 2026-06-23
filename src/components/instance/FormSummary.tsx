import {Heading} from "@uva-fnwi/datanose-ui";
import {union} from "lodash-es";

import {QuestionAnswerList} from "./QuestionAnswerList.tsx";
import {FormSubmitButton} from "~/components/instance/FormSubmitButton.tsx";
import {FormSummaryAssessment} from "~/components/instance/FormSummaryAssessment.tsx";
import {useTranslate} from "~/hooks/useTranslate.ts";
import type {RoleAction, Submission} from "~/store/api/types/submissions.ts";
import {getVisibleQuestionAnswerPairs} from "~/utils/submissionUtils.ts";

type Props = {
    instanceId: string;
    submission: Submission;
    onEditPage?: (index: number) => void;
    onSubmit?: () => void;
    collapseAnswers?: boolean;
    permissions?: RoleAction[];
};

export const FormSummary = ({instanceId, submission, onEditPage, onSubmit, permissions}: Props) => {
    const {t, l} = useTranslate("workflow");

    const effectivePermissions = union(permissions, submission.permissions);
    const canEdit = effectivePermissions.includes("Edit") && submission.dateSubmitted != null;

    const pages = submission.form.pages.filter((p) => p.isInCurrentForm);

    const hasResults = pages.some((p) => p.hasResults);

    if (hasResults) {
        return (
            <>
                <FormSummaryAssessment
                    instanceId={instanceId}
                    submissions={[submission]}
                    onEditPage={onEditPage}
                    combine={false}
                />
                {onSubmit && (
                    <div className="mt-4">
                        <FormSubmitButton
                            instanceId={instanceId}
                            submission={submission}
                            onSubmit={onSubmit}
                            disabled={false}
                        />
                    </div>
                )}
            </>
        );
    }

    return (
        <div key={submission.id} className="flex flex-col gap-2">
            {pages.map((page) => {
                const questionAnswerPairs = getVisibleQuestionAnswerPairs(
                    page.questions,
                    submission.answers,
                );

                return (
                    <div key={page.name} className="py-2">
                        {pages.length > 1 && (
                            <Heading as="h4" size="xs" className="pb-1 font-semibold">
                                {l(page.title)}
                            </Heading>
                        )}
                        <QuestionAnswerList
                            questionAnswerPairs={questionAnswerPairs}
                            noAnswerText={t("version_card.no_answer")}
                            instanceId={instanceId}
                            submissionId={submission.id}
                            canEdit={canEdit}
                        />
                    </div>
                );
            })}
            {onSubmit && (
                <div className="mt-4">
                    <FormSubmitButton
                        instanceId={instanceId}
                        submission={submission}
                        onSubmit={onSubmit}
                    />
                </div>
            )}
        </div>
    );
};
