import {Separator, Text, Tooltip} from "@uva-fnwi/datanose-ui";

import {PageControl} from "~/components/instance/PageControl.tsx";
import {useTranslate} from "~/hooks/useTranslate.ts";
import type {Assessment} from "~/store/api/types/assessments.ts";
import type {Submission} from "~/store/api/types/submissions.ts";

type Props = {
    assessmentResults: Assessment;
    instanceId: string;
    submission: Submission;
};

export const AssessmentFinalOverview = ({assessmentResults, instanceId, submission}: Props) => {
    const {t, l} = useTranslate("workflow");

    if (!assessmentResults.finalGrade) return null;
    return (
        <div className="mt-4 flex flex-col gap-2">
            {assessmentResults.parts.map((part) => (
                <div className="grid grid-cols-2 gap-4">
                    <Text size="md" fontWeight="semibold" className="py-1">
                        {`${l(part.title)} (${part.percentage}%):`}
                    </Text>
                    <Text size="md" className="py-1" fontWeight="semibold">
                        {part.combined?.weightedAverage}
                    </Text>
                </div>
            ))}
            <div className="grid grid-cols-2 gap-4">
                <Text size="lg" fontWeight="semibold" className="py-1">
                    {t("instance.calculations.final_grade")}:
                </Text>
                <Text size="lg" fontWeight="semibold" className="py-1">
                    {assessmentResults.finalGrade?.calculated ? (
                        <Tooltip
                            content={
                                t("instance.calculations.calculated_grade") +
                                assessmentResults.finalGrade.calculated.toFixed(5)
                            }
                        >
                            <span>
                                {l(assessmentResults?.finalGrade?.text) ??
                                    assessmentResults?.finalGrade.rounded ??
                                    "-"}
                            </span>
                        </Tooltip>
                    ) : (
                        (l(assessmentResults?.finalGrade?.text) ??
                        assessmentResults?.finalGrade.rounded ??
                        "-")
                    )}
                </Text>
            </div>
            <Separator weight="bold" className="my-4" />
            {submission?.form.pages.length == 1 && (
                <PageControl
                    instanceId={instanceId}
                    submissionId={submission.id}
                    page={submission.form.pages[0]}
                    showTitle={false}
                />
            )}
        </div>
    );
};
