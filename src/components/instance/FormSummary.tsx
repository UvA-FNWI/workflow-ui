import {Button, Icon, Separator, Text} from "@datanose/ui";

import {QuestionAnswerList} from "./QuestionAnswerList.tsx";
import {FormSubmitButton} from "~/components/instance/FormSubmitButton.tsx";
import {useTranslate} from "~/hooks/useTranslate.ts";
import {assessmentsApi} from "~/store/api/assessmentsApi.ts";
import type {PageType, Submission} from "~/store/api/types/submissions.ts";
import {flattenPagesAndQuestions, getVisibleQuestionAnswerPairs} from "~/utils/submissionUtils.ts";

type Props = {
    instanceId: string;
    submission: Submission;
    onEditPage?: (index: number) => void;
    onSubmit?: () => void;
    pageType?: PageType;
};

export const FormSummary = ({
    instanceId,
    submission,
    onEditPage,
    onSubmit,
    pageType = "Normal",
}: Props) => {
    const {t, l, i18n} = useTranslate("workflow");

    const hasResults =
        pageType === "AssessmentOverview" || submission.form.pages.some((p) => p.hasResults);

    const {data: assessmentResults} = assessmentsApi.endpoints.getResults.useQuery(
        {
            instanceId,
            submissionId: pageType == "AssessmentOverview" ? submission.form.name : submission.id,
        },
        {
            skip: !hasResults,
        },
    );

    const assessmentForms = (assessmentResults?.forms ?? []).filter(
        (f) =>
            Object.keys(f.results ?? {}).length > 0 &&
            Object.values(f.results ?? {}).some((pageResults) =>
                pageResults.some((result) => result.answer !== 0),
            ),
    );

    const assessmentPagesAndQuestions =
        assessmentForms.find((f) => f.id === submission.id)?.results ??
        flattenPagesAndQuestions(assessmentForms);

    const colsMap: Record<number, string> = {
        1: "grid-cols-1",
        2: "grid-cols-2",
        3: "grid-cols-3",
        4: "grid-cols-4",
        5: "grid-cols-5",
    };

    const colsClass = colsMap[(assessmentForms?.length ?? 0) + 1] || "grid-cols-1";

    return (
        <div className="flex flex-col gap-6">
            {/* Assessment columns header */}
            {assessmentForms.length > 1 && (
                <div className={`grid gap-4 ${colsClass}`}>
                    <div></div>
                    {assessmentForms.map((assessment) => (
                        <div key={assessment.id}>
                            <Text fontWeight="normal" size="lg" intent="error">
                                {l(assessment.formTitle)?.toUpperCase()}
                            </Text>
                        </div>
                    ))}
                </div>
            )}
            {submission.form.pages.map((page, index) => (
                <div key={index} className="contents">
                    {/* Page title with edit button */}
                    <div className={`grid gap-4 ${colsClass}`}>
                        <div>
                            <Text fontWeight="semibold" size="lg">
                                {l(page.title)?.toUpperCase()}
                                {assessmentPagesAndQuestions[page.name] &&
                                    ` (${assessmentPagesAndQuestions[page.name].reduce((sum, q) => sum + q.percentage, 0).toLocaleString(i18n.language)}%)`}
                            </Text>
                            {onEditPage && pageType === "Normal" && (
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

                        {assessmentForms.map((assessment) => (
                            <div>
                                {assessment?.weightedAverages[page.name] ? (
                                    <Text fontWeight="bold" size="lg">
                                        {assessment.weightedAverages[page.name].toLocaleString(
                                            i18n.language,
                                        )}
                                    </Text>
                                ) : (
                                    <Text fontWeight="bold" size="lg">
                                        -
                                    </Text>
                                )}
                            </div>
                        ))}
                    </div>
                    {/*CHANGE THIS FOR PER USER OR SOMETHING*/}
                    {/* Questions and answers */}
                    <QuestionAnswerList
                        questionAnswerPairs={getVisibleQuestionAnswerPairs(
                            page.questions,
                            submission.answers,
                            assessmentPagesAndQuestions[page.name],
                        )}
                        noAnswerText={t("instance.summary.no_answer")}
                        instanceId={instanceId}
                        submissionId={submission.id}
                        colsClass={colsClass}
                    />
                    <Separator
                        weight={index == submission.form.pages.length - 1 ? "bold" : "normal"}
                    />
                </div>
            ))}

            {assessmentForms && (
                <div className={`grid gap-4 ${colsClass}`}>
                    <Text fontWeight="bold" size="lg">
                        {t("instance.calculations.final_grade").toUpperCase()}
                    </Text>
                    {assessmentForms.map((assessment) => (
                        <Text fontWeight="bold" size="lg">
                            {assessment?.weightedAverages["total"].toLocaleString(i18n.language)}
                        </Text>
                    ))}
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
