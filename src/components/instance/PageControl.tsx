import {useCallback} from "react";

import {Controller, useForm} from "react-hook-form";

import {Heading, Text} from "@datanose/ui";

import {InputControl} from "./InputControl";
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

    const save = useCallback(
        (val: AnswerInput) => saveAnswer({instanceId, submissionId, answer: val}),
        [instanceId, submissionId, saveAnswer],
    );

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
                        {page.questions.map((question) => (
                            <Controller
                                key={question.name}
                                control={form.control}
                                name={question.name}
                                render={({field}) => {
                                    return (
                                        <div className="mb-4">
                                            <div key={question.name}>
                                                {l(question.text)}
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
                    </form>
                </div>
            </div>
        </>
    );
};
