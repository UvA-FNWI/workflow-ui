import {Button, Icon, Text} from "@datanose/ui";

import {QuestionAnswerList} from "./QuestionAnswerList.tsx";
import {FormSubmitButton} from "~/components/instance/FormSubmitButton.tsx";
import {useTranslate} from "~/hooks/useTranslate.ts";
import {assessmentsApi} from "~/store/api/assessmentsApi.ts";
import type {PageType, Submission} from "~/store/api/types/submissions.ts";
import {getVisibleQuestionAnswerPairs} from "~/utils/submissionUtils.ts";

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

    const resultsForPage = assessmentResults?.forms?.[0];

    return (
        <div className="flex flex-col gap-6">
            {submission.form.pages.map((page, index) => (
                <div key={index} className="flex flex-col gap-3">
                    {/* Page title with edit button */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="flex items-center gap-1">
                            <Text fontWeight="bold" size="lg">
                                {l(page.title)}
                                {resultsForPage?.results[page.name] &&
                                    ` (${resultsForPage?.results[page.name].reduce((sum, q) => sum + q.percentage, 0).toLocaleString(i18n.language)}%)`}
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

                        {/*THIS IS PER USER*/}
                        <div>
                            {resultsForPage?.weightedAverages[page.name] && (
                                <Text fontWeight="bold" size="lg">
                                    {resultsForPage.weightedAverages[page.name].toLocaleString(
                                        i18n.language,
                                    )}
                                </Text>
                            )}
                        </div>
                    </div>
                    {/*CHANGE THIS FOR PER USER OR SOMETHING*/}
                    {/* Questions and answers */}
                    <QuestionAnswerList
                        questionAnswerPairs={getVisibleQuestionAnswerPairs(
                            page.questions,
                            submission.answers,
                        )}
                        noAnswerText={t("instance.summary.no_answer")}
                        instanceId={instanceId}
                        submissionId={submission.id}
                    />
                </div>
            ))}
            {resultsForPage?.weightedAverages["total"] && (
                <div className="grid grid-cols-2 gap-4">
                    <Text fontWeight="bold" size="lg">
                        {t("instance.calculations.final_grade").toUpperCase()}
                    </Text>
                    <Text fontWeight="bold" size="lg">
                        {resultsForPage?.weightedAverages["total"].toLocaleString(i18n.language)}
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
