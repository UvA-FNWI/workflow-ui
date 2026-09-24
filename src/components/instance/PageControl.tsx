import {useCallback, useEffect, useMemo} from "react";

import {useForm} from "react-hook-form";

import {Heading, LoadingSpinner, Separator, Text} from "@uva-fnwi/datanose-ui";

import {FileUploadTable} from "./FileUploadTable";
import {PageElement} from "~/components/instance/PageElement.tsx";
import {useFileQuestions} from "~/hooks/useFileQuestions";
import {useTranslate} from "~/hooks/useTranslate";
import {answersApi} from "~/store/api/answersApi";
import {assessmentsApi} from "~/store/api/assessmentsApi.ts";
import {submissionsEndpoints} from "~/store/api/submissionsApi";
import type {Page, PageElement as PageElementType} from "~/store/api/types/submissions";
import {isPageComplete} from "~/utils/submissionUtils.ts";

type PageControlProps = {
    instanceId: string;
    submissionId: string;
    page: Page;
    showTitle?: boolean;
};

export const PageControl = ({
    instanceId,
    submissionId,
    page,
    showTitle = true,
}: PageControlProps) => {
    const {l, t, i18n} = useTranslate("workflow");
    const {data: submission} = submissionsEndpoints.getSubmission.useQuery({
        instanceId,
        submissionId,
    });

    const answers = useMemo(() => submission?.answers ?? [], [submission]);
    const questions = page.elements
        .filter((element) => element.kind === "Question")
        .map((element) => element.question!);
    const visibleQuestions = questions.filter((q) => {
        const a = answers.find((x) => x.questionName === q.name);
        return !a || a.isVisible;
    });
    const formValues = Object.fromEntries(
        answers.filter((a) => a.isVisible).map((a) => [a.questionName, a.value]),
    );

    const form = useForm({defaultValues: formValues});

    // Sync form values from submission when questions become visible again.
    // When a conditionally hidden question's Controller unmounts, react-hook-form unregisters
    // the field and the value is lost. When the question reappears, restore from submission data.
    useEffect(() => {
        const visibleAnswers = answers.filter((a) => a.isVisible);
        visibleAnswers.forEach((answer) => {
            form.setValue(answer.questionName, answer.value);
        });
    }, [answers, form]);

    const [saveAnswer] = answersApi.endpoints.saveAnswer.useMutation();
    const [saveFile] = answersApi.endpoints.saveFile.useMutation();

    const removeFileAnswer = useCallback(
        async (questionName: string) => {
            try {
                await saveAnswer({
                    instanceId,
                    submissionId,
                    answer: {questionName, value: null},
                }).unwrap();
            } catch (error) {
                console.error("Failed to remove file answer:", error);
                throw error;
            }
        },
        [instanceId, submissionId, saveAnswer],
    );

    const saveFileAnswer = useCallback(
        async (questionName: string, file: File) => {
            try {
                await saveFile({instanceId, submissionId, questionName, file}).unwrap();
                return {success: true, error: null};
            } catch (error) {
                console.error("Failed to upload file:", error);
                return {success: false, error: error as Error};
            }
        },
        [instanceId, submissionId, saveFile],
    );

    const {fileQuestions, fileValuesMap} = useFileQuestions({
        questions: visibleQuestions,
        control: form.control,
    });

    const handleFileSelect = useCallback(
        async (questionName: string, file: File | null) => {
            // Always update form value (file or null)
            form.setValue(questionName, file);
            if (file) {
                const result = await saveFileAnswer(questionName, file);
                // Clear local file on error
                if (!result.success) form.setValue(questionName, null);
                return result;
            }
            return {success: true, error: null};
        },
        [form, saveFileAnswer],
    );

    const areWeightedQuestionsComplete = useMemo(
        () => !!submission && isPageComplete(page, submission, true),
        [submission, page],
    );

    const {data, isFetching: isFetchingAverages} = assessmentsApi.endpoints.getPageResults.useQuery(
        {
            instanceId,
            submissionId,
            pageName: page.name,
        },
        {
            skip: !page.hasResults || !areWeightedQuestionsComplete,
        },
    );

    const pageResult = data?.pageResults?.[0];
    const weightedQuestions = questions.filter((question) => question.percentage != null);
    const totalPercentage = Number(
        weightedQuestions.reduce((sum, question) => sum + (question.percentage ?? 0), 0).toFixed(2),
    );

    const gradeDisplayText =
        totalPercentage === 100
            ? t("instance.calculations.final_grade")
            : t("instance.calculations.average_grade", {
                  page: l(page.title),
              }).toUpperCase();

    const averageGradeContent = areWeightedQuestionsComplete
        ? `${pageResult?.weightedAverage?.toLocaleString(i18n.language) ?? 0}`
        : t("instance.calculations.grading_incomplete");

    const getElementKey = (element: PageElementType, index: number) => {
        switch (element.kind) {
            case "Text":
                return `text-${index}`;
            case "Callout":
                return `callout-${index}`;
            case "Question":
                return `question-${element.question?.name}`;
        }
    };

    return (
        <>
            <div className="mb-4 flex flex-col gap-4">
                {showTitle && (
                    <Heading size="sm" className="pb-2">
                        {l(page.title)}
                        {weightedQuestions.length > 0 &&
                            ` (${totalPercentage.toLocaleString(i18n.language)}%)`}
                    </Heading>
                )}
                {page.elements.length > 0 && (
                    <div>
                        <form className="flex flex-col gap-6">
                            {page.elements.map((element, index) => {
                                const answer =
                                    element.kind === "Question"
                                        ? answers.find(
                                              (a) => a.questionName === element.question!.name,
                                          )
                                        : undefined;
                                return (
                                    <PageElement
                                        key={getElementKey(element, index)}
                                        instanceId={instanceId}
                                        submissionId={submissionId}
                                        element={element}
                                        showCompact={
                                            submission?.form.layout === "Compact" &&
                                            element.kind === "Question" &&
                                            element.question!.type === "Choice"
                                        }
                                        answer={answer}
                                        formControl={form.control}
                                        showPercentages={weightedQuestions.length > 1}
                                    />
                                );
                            })}
                            {fileQuestions.length > 0 && (
                                <FileUploadTable
                                    questions={fileQuestions}
                                    values={fileValuesMap}
                                    answers={submission?.answers}
                                    onFileSelect={handleFileSelect}
                                    onRemoveStoredFile={removeFileAnswer}
                                />
                            )}
                        </form>
                    </div>
                )}

                {page.hasResults && weightedQuestions.length > 1 && (
                    <div className="my-4">
                        <Separator weight="bold" color="black" className="mb-4" />
                        <div className="flex items-center justify-between gap-2 pr-12">
                            <Text size="xl" fontWeight="semibold">
                                {gradeDisplayText}
                            </Text>
                            {isFetchingAverages ? (
                                <LoadingSpinner size="xs" />
                            ) : (
                                <Text size="xl" fontWeight="semibold">
                                    {averageGradeContent}
                                </Text>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </>
    );
};
