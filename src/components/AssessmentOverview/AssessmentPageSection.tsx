import {Button, Heading, Icon, Separator, Text} from "@uva-fnwi/datanose-ui";

import {AssessmentQuestionAnswerList} from "~/components/AssessmentOverview/AssessmentQuestionAnswerList.tsx";
import {AssessmentResultCell} from "~/components/AssessmentOverview/AssessmentResultCell.tsx";
import {type MessageUiSettings} from "~/components/instance/instanceMessageSettings.ts";
import {useTranslate} from "~/hooks/useTranslate.ts";
import type {SourceResult} from "~/store/api/types/assessments.ts";
import type {Page, StepResultsType, Submission} from "~/store/api/types/submissions.ts";
import {getVisibleQuestionAnswerPairs} from "~/utils/submissionUtils.ts";

export type AssessmentPageSectionProps = {
    page: Page;
    submissions: Submission[];
    assessmentSubmissions: SourceResult[];
    instanceId: string;
    colsClass?: string;
    onEditPage?: (pageName: string) => void;
    resultsType?: StepResultsType;
    isLastPage?: boolean;
    showMessages?: boolean;
    messageUi?: MessageUiSettings;
};
export const AssessmentPageSection = ({
    page,
    submissions,
    assessmentSubmissions,
    instanceId,
    onEditPage,
    resultsType,
    isLastPage = false,
    colsClass = "grid-cols-1",
    showMessages = true,
    messageUi,
}: AssessmentPageSectionProps) => {
    const {t, l, i18n} = useTranslate("workflow");

    const questions = page.elements
        .filter((element) => element.kind === "Question")
        .map((element) => element.question!);
    const allQuestionAnswerPairs = assessmentSubmissions.map((sourceResult) =>
        getVisibleQuestionAnswerPairs(
            questions,
            sourceResult.answers,
            submissions.find((s) => s.id == sourceResult.id),
            sourceResult.title,
        ),
    );

    const rowsByName = new Map(
        allQuestionAnswerPairs
            .flat()
            .filter((pair) => pair.answer)
            .map((pair) => [pair.question.name, pair]),
    );
    const rows = questions.map(({name}) => rowsByName.get(name)).filter((row) => row != null);

    if (rows.length === 0) {
        return null;
    }

    return (
        <div className="flex flex-col gap-2">
            {/* Page title with edit button */}
            <div className={`grid gap-4 ${colsClass} w-full max-w-full`}>
                <div className="col-span-2 flex w-48 items-center sm:w-80">
                    <Heading
                        size="xs"
                        as="h3"
                        className="min-w-0 font-semibold wrap-break-word"
                        fontType="heading"
                    >
                        {l(page.title)}
                        {page.percentage != null &&
                            ` (${page.percentage.toLocaleString(i18n.language)}%)`}
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

                {/* Weighted averages for the page for each submission */}
                {assessmentSubmissions.map((source) => {
                    const pageResult = source.pageResults.find(
                        (result) => result.name === page.name,
                    );
                    const grade = pageResult?.weightedAverage ?? pageResult?.sum;
                    const hasGrade = !!(pageResult?.weightedAverage || pageResult?.sum);
                    return (
                        <AssessmentResultCell key={source.id} showMessageColumn={showMessages}>
                            <Text fontWeight={hasGrade ? "semibold" : "bold"} size="lg">
                                {hasGrade ? grade?.toLocaleString(i18n.language) : "-"}
                            </Text>
                        </AssessmentResultCell>
                    );
                })}
            </div>
            {/* Questions and answers */}
            {allQuestionAnswerPairs.flat().length > 0 && (
                <AssessmentQuestionAnswerList
                    rows={rows}
                    questionAnswerPairs={allQuestionAnswerPairs}
                    instanceId={instanceId}
                    colsClass={colsClass}
                    collapseAnswers={true}
                    showMessages={showMessages}
                    messageUi={messageUi}
                />
            )}

            <Separator weight={isLastPage ? "bold" : "normal"} />
        </div>
    );
};
