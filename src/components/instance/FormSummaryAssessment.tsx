import {Button, Callout, Heading, Icon, Separator, Text} from "@uva-fnwi/datanose-ui";

import {QuestionAnswerList} from "./QuestionAnswerList.tsx";
import {PageControl} from "~/components/instance/PageControl.tsx";
import {useTranslate} from "~/hooks/useTranslate.ts";
import {assessmentsApi} from "~/store/api/assessmentsApi.ts";
import type {SourceResult} from "~/store/api/types/assessments.ts";
import type {FormType, Submission} from "~/store/api/types/submissions.ts";
import {getVisibleQuestionAnswerPairs} from "~/utils/submissionUtils.ts";

type Props = {
    instanceId: string;
    submissions: Submission[];
    onEditPage?: (index: number) => void;
    formType?: FormType;
    collapseAnswers?: boolean;
    combine: boolean;
};

export const FormSummaryAssessment = ({
    instanceId,
    submissions,
    onEditPage,
    formType = "Normal",
    combine,
}: Props) => {
    const {t, l, i18n} = useTranslate("workflow");

    const {data: assessmentResults} = assessmentsApi.endpoints.getAssessmentResults.useQuery({
        instanceId,
        submissionId: formType != "AssessmentFinalOverview" ? submissions[0].id : undefined,
        combine,
    });

    if (!assessmentResults || !assessmentResults?.parts || assessmentResults?.parts?.length == 0) {
        return (
            <div className="my-4">
                <Text className="italic">{t("instance.empty_step")}</Text>
            </div>
        );
    }

    if (formType == "AssessmentFinalOverview")
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
                        {assessmentResults?.finalGrade ?? "-"}
                    </Text>
                </div>
                <Separator weight="bold" className="my-4" />
                {submissions[0].form.pages.length == 1 && (
                    <PageControl
                        instanceId={instanceId}
                        submissionId={submissions[0].id}
                        page={submissions[0].form.pages[0]}
                        showTitle={false}
                    />
                )}
            </div>
        );

    const assessmentSubmissions = assessmentResults.parts
        .flatMap((part) => [...(part.sourceResults ?? []), part.combined])
        .filter(
            (sourceResult) => sourceResult && sourceResult.pageResults?.length > 0,
        ) as SourceResult[];

    const hasTotalWeightedAverage =
        assessmentSubmissions.length > 0 && (assessmentResults?.finalGrade ?? 0) > 0;

    const colsList = ["grid-cols-1", "grid-cols-2", "grid-cols-3", "grid-cols-4", "grid-cols-5"];
    const colsClass = colsList[assessmentSubmissions?.length ?? 1];

    return (
        <div className="overflow-x-auto">
            <div className="flex min-w-xl flex-col gap-6">
                {/* Assessment columns header */}
                {assessmentSubmissions.length > 1 && (
                    <div className={`grid gap-4 ${colsClass}`}>
                        <div></div>
                        {assessmentSubmissions.map((assessmentPart) => (
                            <div key={assessmentPart.id} className="w-48">
                                <Text fontWeight="normal" size="lg" intent="error">
                                    {l(assessmentPart.title)?.toUpperCase()}{" "}
                                    {assessmentPart.percentage && `(${assessmentPart.percentage}%)`}
                                </Text>
                            </div>
                        ))}
                    </div>
                )}
                {submissions[0].form.pages.map((page, index) => {
                    const allQuestionAnswerPairs = assessmentSubmissions.map((sourceResult) =>
                        getVisibleQuestionAnswerPairs(
                            page.questions,
                            sourceResult.answers,
                            sourceResult.pageResults.find((p) => p.name === page.name)
                                ?.questionResults ?? [],
                            submissions.find((s) => s.id == sourceResult.id),
                        ),
                    );

                    if (!allQuestionAnswerPairs.some((p) => p.some((r) => r.answer))) {
                        return null;
                    }

                    const firstPageResult = assessmentSubmissions[0]?.pageResults.find(
                        (p) => p.name === page.name,
                    );

                    return (
                        <div key={index} className="contents">
                            {/* Page title with edit button */}
                            <div className={`grid gap-4 ${colsClass} w-full max-w-full`}>
                                <div className="flex items-center">
                                    <Heading size="xs" className="font-semibold">
                                        {l(page.title)?.toUpperCase()}
                                        {(firstPageResult?.questionResults?.filter((q) => q.weight)
                                            .length ?? 0) > 0 &&
                                            ` (${firstPageResult?.questionResults.reduce((sum, q) => sum + q.percentage, 0).toLocaleString(i18n.language)}%)`}
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

                                {assessmentSubmissions.map((sourceResult) => {
                                    const pageResult = sourceResult.pageResults.find(
                                        (p) => p.name === page.name,
                                    );
                                    return (
                                        <div key={sourceResult.id}>
                                            {pageResult?.weightedAverage || pageResult?.sum ? (
                                                <Text fontWeight="semibold" size="lg">
                                                    {(
                                                        pageResult.weightedAverage ?? pageResult.sum
                                                    ).toLocaleString(i18n.language)}
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
                                    noAnswerText=" "
                                    instanceId={instanceId}
                                    colsClass={colsClass}
                                    collapseAnswers={true}
                                />
                            )}
                            <Separator
                                weight={
                                    index == submissions[0].form.pages.length - 1
                                        ? "bold"
                                        : "normal"
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
                        {assessmentSubmissions.map((sourceResult) => (
                            <Text fontWeight="semibold" size="xl">
                                {sourceResult.weightedAverage?.toLocaleString(i18n.language)}
                            </Text>
                        ))}
                    </div>
                )}

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
