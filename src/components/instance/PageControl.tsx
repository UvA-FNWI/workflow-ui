import {useCallback} from "react";

import {Controller, useForm} from "react-hook-form";

import {Button, Heading, Text} from "@datanose/ui";

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
    currentTabIndex: number;
    onNext: () => void;
    onPrevious: () => void;
};

export const PageControl = ({
    instanceId,
    submissionId,
    page,
    currentTabIndex,
    onNext,
    onPrevious,
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

    const save = useCallback(
        (val: AnswerInput) => saveAnswer({instanceId, submissionId, answer: val}),
        [instanceId, submissionId, saveAnswer],
    );

    const {fileQuestions, regularQuestions, fileValuesMap} = useFileQuestions({
        questions: page.questions,
        control: form.control,
    });

    return (
        <>
            <div className="mb-4 flex flex-col gap-4 pt-4">
                <div>
                    <Heading size="sm" className="uppercase" fontType="body">
                        {l(page.title)}
                    </Heading>
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
                                            <div key={question.name}>{l(question.text)}</div>
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
                                questions={fileQuestions}
                                values={fileValuesMap}
                                onFileSelect={(questionName, file) => {
                                    form.setValue(questionName, file);
                                    if (file) {
                                        save({questionName, value: file});
                                    }
                                }}
                            />
                        )}
                    </form>
                </div>
            </div>
            <div className="mt-4 flex justify-between gap-2">
                {currentTabIndex > 0 && (
                    <Button intent="secondary" onClick={onPrevious}>
                        {t("go_back")}
                    </Button>
                )}
                <Button
                    intent="secondary"
                    onClick={onNext}
                    className={currentTabIndex === 0 ? "ml-auto" : ""}
                >
                    {t("continue")}
                </Button>
            </div>
        </>
    );
};
