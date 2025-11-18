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
};

export const PageControl = ({instanceId, submissionId, page}: PageControlProps) => {
    const {l} = useTranslate("workflow");
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
        <div className="flex flex-col gap-4">
            <div>
                <Heading className="uppercase">{l(page.title)}</Heading>
                <Text>{l(page.introduction)}</Text>
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
                                    <>
                                        <div key={question.name}>{l(question.text)}</div>
                                        <InputControl
                                            value={field.value}
                                            onChange={field.onChange}
                                            question={question}
                                            onSave={(val) => save(val as AnswerInput)}
                                        />
                                    </>
                                );
                            }}
                        />
                    ))}
                </form>
            </div>
        </div>
    );
};
