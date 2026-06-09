import {Button, Heading, Icon, Separator, Text} from "@uva-fnwi/datanose-ui";

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
    console.log("assessmentResults", assessmentResults);

    const assessmentParts = (assessmentResults?.parts ?? []).filter(
        (f) =>
            f.sourceResults != null &&
            f.sourceResults.pageResults.some((pageResult) =>
                pageResult.questionResults.some((questionResult) => questionResult.answer !== 0),
            ),
    );

    const hasTotalWeightedAverage =
        assessmentParts.length > 0 && (assessmentResults?.finalGrade ?? 0) > 0;

    const colsList = ["grid-cols-1", "grid-cols-2", "grid-cols-3", "grid-cols-4", "grid-cols-5"];
    const colsClass = colsList[assessmentParts?.length ?? 1];

    return (
        <div className="overflow-x-auto">
            <div className="flex min-w-xl flex-col gap-6">
                {/* Assessment columns header */}
                {assessmentParts.length > 1 && (
                    <div className={`grid gap-4 ${colsClass}`}>
                        <div></div>
                        {assessmentParts.map((assessmentPart) => (
                            <div key={assessmentPart.id} className="w-48">
                                <Text fontWeight="normal" size="lg" intent="error">
                                    {l(assessmentPart.sourceTitle)?.toUpperCase()}
                                </Text>
                            </div>
                        ))}
                    </div>
                )}
                {submission.form.pages.map((page, index) => {
                    const allQuestionAnswerPairs = assessmentParts.map((a) =>
                        getVisibleQuestionAnswerPairs(
                            page.questions,
                            a.answers,
                            assessmentParts
                                .find((f) => f.id === a.id)
                                ?.sourceResults?.pageResults.find((p) => p.pageName === page.name)
                                ?.questionResults ?? [],
                        ),
                    );

                    const firstPageResult = assessmentParts[0]?.sourceResults?.pageResults.find(
                        (p) => p.pageName === page.name,
                    );

                    return (
                        <div key={index} className="contents">
                            {/* Page title with edit button */}
                            <div className={`grid gap-4 ${colsClass} w-full max-w-full`}>
                                <div className="flex items-center">
                                    <Heading size="xs" className="font-semibold">
                                        {l(page.title)?.toUpperCase()}
                                        {firstPageResult?.questionResults?.length &&
                                            ` (${firstPageResult.questionResults.reduce((sum, q) => sum + q.percentage, 0).toLocaleString(i18n.language)}%)`}
                                    </Heading>
                                    {onEditPage &&
                                        formType === "Normal" &&
                                        page.isInCurrentForm && (
                                            <Button
                                                intent="ghost"
                                                size="small"
                                                className="ml-1"
                                                shape="circular"
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

                                {assessmentParts.map((assessment) => {
                                    const pageResult = assessment.sourceResults?.pageResults.find(
                                        (p) => p.pageName === page.name,
                                    );
                                    return (
                                        <div key={assessment.id}>
                                            {pageResult?.weightedAverage ? (
                                                <Text fontWeight="semibold" size="lg">
                                                    {pageResult.weightedAverage.toLocaleString(
                                                        i18n.language,
                                                    )}
                                                </Text>
                                            ) : (
                                                <Text fontWeight="bold" size="lg">
                                                    -
                                                </Text>
                                            )}
                                        </div>
                                    );
                                })}
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
                        <Text fontWeight="semibold" size="xl">
                            {t("instance.calculations.final_grade").toUpperCase()}
                        </Text>
                        <Text fontWeight="semibold" size="xl">
                            {assessmentResults?.finalGrade?.toLocaleString(i18n.language)}
                        </Text>
                    </div>
                )}
            </div>
        </div>
    );
};
