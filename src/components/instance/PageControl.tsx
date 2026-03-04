import {useCallback} from "react";

import {Controller, useForm} from "react-hook-form";

import {Heading, Text} from "@datanose/ui";

import {FileUploadTable} from "./FileUploadTable";
import {InputControl} from "./InputControl";
import {useFileQuestions} from "~/hooks/useFileQuestions";
import {useTranslate} from "~/hooks/useTranslate";
import {answersApi} from "~/store/api/answersApi";
import {submissionsEndpoints} from "~/store/api/submissionsApi";
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
    const {l, t} = useTranslate("workflow");
    const {data: submission} = submissionsEndpoints.getSubmission.useQuery({
        instanceId,
        submissionId,
    });
    const answers = submission?.answers
        .filter((a) => a.isVisible)
        .reduce(
            (a, v) => ({
                ...a,
                [v.questionName]: v.value,
            }),
            {},
        ) as {[id: string]: unknown};

    const form = useForm({
        defaultValues: answers || {},
    });

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
        questions: page.questions,
        control: form.control,
    });

    return (
        <>
            <div className="mb-4 flex flex-col gap-4 pt-4">
                <div>
                    {showTitle && (
                        <Heading size="sm" className="uppercase" fontType="body">
                            {l(page.title)}
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
                                                {question.weight && ` (${question.weight}%)`}
                                                {!question.isRequired && ` ${t("optional")}`}
                                            </div>
                                            <InputControl
                                                value={field.value}
                                                onChange={field.onChange}
                                                question={question}
                                                onSave={(val: unknown) => save(val as AnswerInput)}
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
            </div>
        </>
    );
};
