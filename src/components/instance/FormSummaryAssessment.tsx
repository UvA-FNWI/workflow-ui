import {Button, Icon, Separator, Text} from "@uva-fnwi/datanose-ui";

import {QuestionAnswerList} from "./QuestionAnswerList.tsx";
import {useTranslate} from "~/hooks/useTranslate.ts";
import {assessmentsApi} from "~/store/api/assessmentsApi.ts";
import type {FormType, Submission} from "~/store/api/types/submissions.ts";
import {getVisibleQuestionAnswerPairs} from "~/utils/submissionUtils.ts";

type Props = {
    instanceId: string;
    submission: Submission;
    onEditPage?: (index: number) => void;
    formType?: FormType;
    collapseAnswers?: boolean;
};

export const FormSummaryAssessment = ({
    instanceId,
    submission,
    onEditPage,
    formType = "Normal",
}: Props) => {
    const {t, l, i18n} = useTranslate("workflow");

    const {data: assessmentResults} = assessmentsApi.endpoints.getResults.useQuery({
        instanceId,
        submissionId: formType == "AssessmentOverview" ? submission.form.name : submission.id,
    });

    const assessmentForms = (assessmentResults?.forms ?? []).filter(
        (f) =>
            Object.keys(f.results ?? {}).length > 0 &&
            Object.values(f.results ?? {}).some((pageResults) =>
                pageResults.some((result) => result.answer !== 0),
            ),
    );

    const hasTotalWeightedAverage =
        assessmentForms.length > 0 && (assessmentResults?.totalWeightedAverage ?? 0) > 0;

    const colsList = ["grid-cols-1", "grid-cols-2", "grid-cols-3", "grid-cols-4", "grid-cols-5"];
    const colsClass = colsList[assessmentForms?.length ?? 1];

    return (
        <div className="overflow-x-auto">
            <div className="flex min-w-xl flex-col gap-6">
                {/* Assessment columns header */}
                {assessmentForms.length > 1 && (
                    <div className={`grid gap-4 ${colsClass}`}>
                        <div></div>
                        {assessmentForms.map((assessment) => (
                            <div key={assessment.id} className="w-48">
                                <Text fontWeight="normal" size="lg" intent="error">
                                    {l(assessment.formTitle)?.toUpperCase()}
                                </Text>
                            </div>
                        ))}
                    </div>
                )}
                {submission.form.pages.map((page, index) => {
                    const allQuestionAnswerPairs = assessmentForms.map((a) =>
                        getVisibleQuestionAnswerPairs(
                            page.questions,
                            a.answers,
                            assessmentForms.find((f) => f.id === a.id)?.results?.[page.name],
                        ),
                    );

                    return (
                        <div key={index} className="contents">
                            {/* Page title with edit button */}
                            <div className={`grid gap-4 ${colsClass} w-full max-w-full`}>
                                <div className="flex items-center">
                                    <Text fontWeight="semibold" size="lg">
                                        {l(page.title)?.toUpperCase()}
                                        {assessmentForms[0]?.results?.[page.name]?.length &&
                                            ` (${assessmentForms[0].results?.[page.name].reduce((sum, q) => sum + q.percentage, 0).toLocaleString(i18n.language)}%)`}
                                    </Text>
                                    {onEditPage &&
                                        formType === "Normal" &&
                                        page.isInCurrentForm && (
                                            <Button
                                                intent="ghost"
                                                size="small"
                                                shape="circular"
                                                className="ui:border-0 ui:hover:enabled:bg-grey-100 ui:dark:hover:enabled:bg-grey-800"
                                                onClick={() => onEditPage(index)}
                                                rightIcon={
                                                    <Icon
                                                        name="edit-line"
                                                        size="xs"
                                                        color="danger"
                                                    />
                                                }
                                                aria-label={t("instance.summary.edit_page", {
                                                    pageTitle: l(page.title),
                                                })}
                                            ></Button>
                                        )}
                                </div>

                                {assessmentForms.map((assessment) => (
                                    <div key={assessment.id}>
                                        {assessment?.weightedAverages[page.name] ? (
                                            <Text fontWeight="bold" size="lg">
                                                {assessment.weightedAverages[
                                                    page.name
                                                ].toLocaleString(i18n.language)}
                                            </Text>
                                        ) : (
                                            <Text fontWeight="bold" size="lg">
                                                -
                                            </Text>
                                        )}
                                    </div>
                                ))}
                            </div>
                            {/* Questions and answers */}
                            {allQuestionAnswerPairs.flat().length > 0 && (
                                <QuestionAnswerList
                                    questionAnswerPairs={allQuestionAnswerPairs}
                                    noAnswerText={t("instance.summary.no_answer")}
                                    instanceId={instanceId}
                                    submissionId={submission.id}
                                    colsClass={colsClass}
                                    collapseAnswers={true}
                                />
                            )}
                            <Separator
                                weight={
                                    index == submission.form.pages.length - 1 ? "bold" : "normal"
                                }
                            />
                        </div>
                    );
                })}

                {hasTotalWeightedAverage && (
                    <div className={`grid gap-4 ${colsClass}`}>
                        <Text fontWeight="bold" size="lg">
                            {t("instance.calculations.final_grade").toUpperCase()}
                        </Text>
                        <Text fontWeight="bold" size="lg">
                            {assessmentResults?.totalWeightedAverage?.toLocaleString(i18n.language)}
                        </Text>
                    </div>
                )}
            </div>
        </div>
    );
};
