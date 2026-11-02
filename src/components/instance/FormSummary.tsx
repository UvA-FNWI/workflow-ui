import {Heading} from "@uva-fnwi/datanose-ui";

import {QuestionAnswerList} from "./QuestionAnswerList.tsx";
import {AssessmentOverview} from "~/components/AssessmentOverview/AssessmentOverview.tsx";
import {useTranslate} from "~/hooks/useTranslate.ts";
import type {Submission} from "~/store/api/types/submissions.ts";
import {getVisibleQuestionAnswerPairs} from "~/utils/submissionUtils.ts";

type Props = {
    instanceId: string;
    submission: Submission;
    onEditPage?: (pageName: string) => void;
    collapseAnswers?: boolean;
};

export const FormSummary = ({instanceId, submission, onEditPage}: Props) => {
    const {l} = useTranslate("workflow");

    // Only form-scoped Edit counts: the instance-level permission is form-less (property editing only)
    // and the backend rejects answer edits based on it. See Action.MatchesForm.
    const canEdit = submission.permissions.includes("Edit") && submission.dateSubmitted != null;

    const pages = submission.form.pages.filter((p) => p.isInCurrentForm && p.isActive);

    const hasResults = pages.some((p) => p.hasResults);

    if (hasResults) {
        return (
            <AssessmentOverview
                instanceId={instanceId}
                submissions={[submission]}
                onEditPage={onEditPage}
                combine={false}
            />
        );
    }

    return (
        <div key={submission.id} className="flex flex-col gap-6">
            {pages.map((page) => {
                const questions = page.elements
                    .filter((element) => element.kind === "Question")
                    .map((element) => element.question!);
                const questionAnswerPairs = getVisibleQuestionAnswerPairs(
                    questions,
                    submission.answers,
                );

                return (
                    <div key={page.name} className="py-2">
                        {pages.length > 1 && (
                            <Heading as="h4" size="xs" className="pb-2 font-semibold">
                                {l(page.title)?.toUpperCase()}
                            </Heading>
                        )}
                        <QuestionAnswerList
                            questionAnswerPairs={questionAnswerPairs}
                            instanceId={instanceId}
                            submissionId={submission.id}
                            canEdit={canEdit}
                        />
                    </div>
                );
            })}
        </div>
    );
};
