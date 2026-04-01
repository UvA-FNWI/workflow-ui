import {useCallback, useEffect, useMemo} from "react";

import {Controller, useForm} from "react-hook-form";

import {Heading, LoadingSpinner, Text} from "@datanose/ui";

import {FileUploadTable} from "./FileUploadTable";
import {InputControl} from "./InputControl";
import {useFileQuestions} from "~/hooks/useFileQuestions";
import {useTranslate} from "~/hooks/useTranslate";
import {answersApi} from "~/store/api/answersApi";
import {assessmentsApi} from "~/store/api/assessmentsApi.ts";
import {submissionsEndpoints} from "~/store/api/submissionsApi";
import type {Result} from "~/store/api/types/assessments.ts";
import type {AnswerInput} from "~/store/api/types/params";
import type {Page} from "~/store/api/types/submissions";

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
    const visibleQuestions = page.questions.filter((q) => {
        const a = answers.find((x) => x.questionName === q.name);
        return !a || a.isVisible !== false;
    });
    const formValues = Object.fromEntries(
        answers.filter((a) => a.isVisible !== false).map((a) => [a.questionName, a.value]),
    );

    const form = useForm({defaultValues: formValues});

    // Sync form values from submission when questions become visible again.
    // When a conditionally hidden question's Controller unmounts, react-hook-form unregisters
    // the field and the value is lost. When the question reappears, restore from submission data.
    useEffect(() => {
        const visibleAnswers = answers.filter((a) => a.isVisible !== false);
        visibleAnswers.forEach((answer) => {
            const valueInForm = form.getValues(answer.questionName);
            if (valueInForm === undefined) {
                form.setValue(answer.questionName, answer.value);
            }
        });
    }, [answers, form]);

    const [saveAnswer] = answersApi.endpoints.saveAnswer.useMutation();
    const [saveFile] = answersApi.endpoints.saveFile.useMutation();

    const save = useCallback(
        (val: AnswerInput) => saveAnswer({instanceId, submissionId, answer: val}),
        [instanceId, submissionId, saveAnswer],
    );

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

    const {fileQuestions, regularQuestions, fileValuesMap} = useFileQuestions({
        questions: visibleQuestions,
        control: form.control,
    });

    const {data, isFetching: isFetchingAverages} = assessmentsApi.endpoints.getResultsPage.useQuery(
        {
            instanceId,
            submissionId,
            pageName: page.name,
        },
        {
            skip: !page.hasResults,
        },
    );
    const formForPage = data?.forms?.[0]; // form for the current page
    const results = formForPage?.results?.[page.name];
    const weightedAverage = formForPage?.weightedAverages?.[page.name] ?? 0;

    const getTotalPercentage = (r: Result[]) =>
        Number(r.reduce((sum, q) => sum + q.percentage, 0).toFixed(2));

    const getPercentage = (r: Result[], questionName: string) =>
        r.find((q) => q.questionName === questionName)?.percentage;

    return (
        <>
            <div className="mb-4 flex flex-col gap-4 pt-4">
                <div>
                    {showTitle && (
                        <Heading size="sm" className="uppercase" fontType="body">
                            {l(page.title)}
                            {results &&
                                results.length > 0 &&
                                ` (${getTotalPercentage(results).toLocaleString(i18n.language)}%)`}
                        </Heading>
                    )}
                    {page.introduction && <Text size="lg">{l(page.introduction)}</Text>}
                </div>
                <div>
                    <form>
                        {regularQuestions.map((question) => (
                            <Controller
                                key={question.name}
                                control={form.control}
                                name={question.name}
                                render={({field}) => {
                                    return (
                                        <div className="mb-4">
                                            <div key={question.name}>
                                                {l(question.text)}
                                                {results &&
                                                    results.find(
                                                        (q) => q.questionName == question.name,
                                                    ) &&
                                                    ` (${getPercentage(results, question.name)?.toLocaleString(i18n.language)}%)`}
                                                {!question.isRequired && ` ${t("optional")}`}
                                            </div>
                                            <InputControl
                                                value={field.value}
                                                onChange={field.onChange}
                                                question={question}
                                                onSave={save}
                                            />
                                        </div>
                                    );
                                }}
                            />
                        ))}

                        {fileQuestions.length > 0 && (
                            <FileUploadTable
                                instanceId={instanceId}
                                submissionId={submissionId}
                                questions={fileQuestions}
                                values={fileValuesMap}
                                answers={submission?.answers}
                                onFileSelect={async (questionName, file) => {
                                    // Always update form value (file or null)
                                    form.setValue(questionName, file);

                                    if (file) {
                                        const result = await saveFileAnswer(questionName, file);
                                        // Clear local file on error
                                        if (!result.success) {
                                            form.setValue(questionName, null);
                                        }
                                        return result;
                                    }

                                    return {success: true, error: null};
                                }}
                                onRemoveStoredFile={removeFileAnswer}
                            />
                        )}
                    </form>
                </div>
                <div>
                    {typeof weightedAverage == "number" && weightedAverage !== 0 && (
                        <Heading className="flex items-center gap-2">
                            {t("instance.calculations.average_grade", {
                                page: l(page.title),
                            }).toUpperCase()}

                            {isFetchingAverages ? (
                                <LoadingSpinner size="xs" />
                            ) : (
                                <span>{weightedAverage.toLocaleString(i18n.language)}</span>
                            )}
                        </Heading>
                    )}
                </div>
            </div>
        </>
    );
};
