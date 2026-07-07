import {Button, Heading, Icon, Separator, Text} from "@uva-fnwi/datanose-ui";

import {AssessmentQuestionAnswerList} from "~/components/AssessmentOverview/AssessmentQuestionAnswerList.tsx";
import {useTranslate} from "~/hooks/useTranslate.ts";
import type {SourceResult} from "~/store/api/types/assessments.ts";
import type {Form, Page, StepResultsType, Submission} from "~/store/api/types/submissions.ts";
import {getVisibleQuestionAnswerPairs} from "~/utils/submissionUtils.ts";

export type AssessmentPageSectionProps = {
    page: Page;
    submissions: Submission[];
    assessmentSubmissions: SourceResult[];
    form: Form;
    instanceId: string;
    index: number;
    colsClass?: string;
    onEditPage?: (pageName: string) => void;
    resultsType?: StepResultsType;
};
export const AssessmentPageSection = ({
    page,
    submissions,
    assessmentSubmissions,
    form,
    instanceId,
    index,
    onEditPage,
    resultsType,
    colsClass = "grid-cols-1",
}: AssessmentPageSectionProps) => {
    const {t, l, i18n} = useTranslate("workflow");
    const allQuestionAnswerPairs = assessmentSubmissions.map((sourceResult) =>
        getVisibleQuestionAnswerPairs(
            page.questions,
            sourceResult.answers,
            sourceResult.pageResults.find((p) => p.name === page.name)?.questionResults ?? [],
            submissions.find((s) => s.id == sourceResult.id),
            sourceResult.title,
        ),
    );

    if (!allQuestionAnswerPairs.some((p) => p.some((r) => r.answer))) {
        return null;
    }

    const firstPageResult = assessmentSubmissions[0]?.pageResults.find((p) => p.name === page.name);

    console.log("INDEX", index, page.index);
    return (
        <div key={page.index} className="flex flex-col gap-2">
            {/* Page title with edit button */}
            <div className={`grid gap-4 ${colsClass} w-full max-w-full`}>
                <div className="col-span-2 flex items-center">
                    <Heading size="xs" className="font-semibold" fontType="heading">
                        {l(page.title)}
                        {(firstPageResult?.questionResults?.filter((q) => q.weight).length ?? 0) >
                            0 &&
                            ` (${firstPageResult?.questionResults.reduce((sum, q) => sum + q.percentage, 0).toLocaleString(i18n.language)}%)`}
                    </Heading>
                    {onEditPage && resultsType === "Normal" && page.isInCurrentForm && (
                        <Button
                            intent="ghost"
                            size="small"
                            className="ml-1"
                            shape="circular"
                            onClick={() => onEditPage(page.name)}
                            rightIcon={<Icon name="edit-line" size="xs" color="danger" />}
                            aria-label={t("instance.summary.edit_page", {
                                pageTitle: l(page.title),
                            })}
                        ></Button>
                    )}
                </div>

                {assessmentSubmissions.map((sourceResult) => {
                    const pageResult = sourceResult.pageResults.find((p) => p.name === page.name);
                    return (
                        <div key={sourceResult.id}>
                            {pageResult?.weightedAverage || pageResult?.sum ? (
                                <Text fontWeight="semibold" size="lg">
                                    {(pageResult.weightedAverage ?? pageResult.sum).toLocaleString(
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
                <AssessmentQuestionAnswerList
                    questionAnswerPairs={allQuestionAnswerPairs}
                    noAnswerText=" "
                    instanceId={instanceId}
                    colsClass={colsClass}
                    collapseAnswers={true}
                />
            )}
            <Separator weight={index == form.pages.length - 1 ? "bold" : "normal"} />
        </div>
    );
};
