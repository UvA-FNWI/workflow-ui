import {Callout, Text} from "@uva-fnwi/datanose-ui";

import {AssessmentFinalOverview} from "~/components/AssessmentOverview/AssessmentFinalOverview.tsx";
import {AssessmentPageSection} from "~/components/AssessmentOverview/AssessmentPageSection.tsx";
import {PageControl} from "~/components/instance/PageControl.tsx";
import {useTranslate} from "~/hooks/useTranslate.ts";
import {assessmentsApi} from "~/store/api/assessmentsApi.ts";
import type {SourceResult} from "~/store/api/types/assessments.ts";
import type {WorkflowStep} from "~/store/api/types/instances.ts";
import type {Submission} from "~/store/api/types/submissions.ts";

type Props = {
    instanceId: string;
    submissions: Submission[];
    onEditPage?: (pageName: string) => void;
    step?: WorkflowStep;
    collapseAnswers?: boolean;
    combine: boolean;
};

export const AssessmentOverview = ({instanceId, submissions, onEditPage, step, combine}: Props) => {
    const {t, l, i18n} = useTranslate("workflow");

    const {data: assessmentResults} = assessmentsApi.endpoints.getAssessmentResults.useQuery({
        instanceId,
        submissionId:
            step?.resultsType === "AssessmentFinalOverview"
                ? undefined
                : step?.resultsType === "AssessmentPartOverview"
                  ? step.id
                  : submissions[0]?.id,
        combine,
    });

    const resultsType = step?.resultsType ?? "Normal";

    if (!assessmentResults || !assessmentResults?.parts || assessmentResults?.parts?.length == 0) {
        return (
            <div className="my-4">
                <Text className="italic">{t("instance.empty_step")}</Text>
            </div>
        );
    }
    console.log("submissions", submissions);

    if (step?.resultsType === "AssessmentFinalOverview") {
        return (
            <div className="flex flex-col gap-2">
                <AssessmentFinalOverview instanceId={instanceId} combine={combine} />
                {submissions[0]?.form.pages.length == 1 && (
                    <PageControl
                        instanceId={instanceId}
                        submissionId={submissions[0].id}
                        page={submissions[0].form.pages[0]}
                        showTitle={false}
                    />
                )}
            </div>
        );
    }

    const assessmentSubmissions = assessmentResults.parts
        .flatMap((part) => [...(part.sourceResults ?? []), part.combined])
        .filter(
            (sourceResult) => sourceResult && sourceResult.pageResults?.length > 0,
        ) as SourceResult[];

    const hasWeightedAverage =
        assessmentSubmissions.length > 0 &&
        assessmentSubmissions.some((s) => s.weightedAverage > 0);

    const form = assessmentResults.parts[0]?.form ?? submissions[0]?.form;

    const colsList = ["grid-cols-1", "grid-cols-2", "grid-cols-3", "grid-cols-4", "grid-cols-5"];
    const colsClass =
        colsList[assessmentSubmissions?.length ? assessmentSubmissions.length + 1 : 1];

    return (
        <div className="overflow-x-auto">
            <div className="flex flex-col gap-6">
                {/* Assessment columns header */}
                {assessmentSubmissions.length > 1 && (
                    <div className={`grid gap-4 ${colsClass}`}>
                        <div className="col-span-2"></div>
                        {assessmentSubmissions.map((assessmentPart) => (
                            <div key={assessmentPart.id}>
                                <Text fontWeight="normal" size="lg" intent="error">
                                    {l(assessmentPart.title)?.toUpperCase()}{" "}
                                    {assessmentPart.percentage && `(${assessmentPart.percentage}%)`}
                                </Text>
                            </div>
                        ))}
                    </div>
                )}
                {/* Assessment page sections */}
                {form?.pages.map((page, index) => (
                    <AssessmentPageSection
                        page={page}
                        assessmentSubmissions={assessmentSubmissions}
                        submissions={submissions}
                        form={form}
                        index={index}
                        onEditPage={onEditPage}
                        resultsType={resultsType}
                        instanceId={instanceId}
                        colsClass={colsClass}
                    />
                ))}

                {/* Final grade */}
                {hasWeightedAverage && (
                    <div className={`grid gap-4 ${colsClass}`}>
                        <Text fontWeight="semibold" size="xl" className="col-span-2">
                            {t("instance.calculations.final_grade").toUpperCase()}
                        </Text>
                        {assessmentSubmissions.map((sourceResult) => (
                            <Text fontWeight="semibold" size="xl">
                                {sourceResult.weightedAverage?.toLocaleString(i18n.language)}
                            </Text>
                        ))}
                    </div>
                )}

                {/* Discrepancy warning */}
                {assessmentResults.parts[0].showDiscrepancyWarning &&
                    assessmentSubmissions.length > 1 && (
                        <Callout type="warning">
                            {t("instance.calculations.discrepancy_warning")}
                        </Callout>
                    )}
            </div>
        </div>
    );
};
