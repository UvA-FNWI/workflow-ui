import {Disclosure, Heading, Text} from "@datanose/ui";

import {QuestionAnswerList} from "./QuestionAnswerList.tsx";
import {useTranslate} from "~/hooks/useTranslate.ts";
import type {WorkflowStepVersion} from "~/store/api/types/instances";
import {formatDate} from "~/utils/formatDate.ts";

type Props = {
    version: WorkflowStepVersion;
};

export const VersionCard = ({version}: Props) => {
    const {t, i18n, l} = useTranslate("workflow", {keyPrefix: "version_card"});

    return (
        <Disclosure key={version.versionNumber}>
            <Disclosure.Header>
                <div className="flex w-full items-center justify-between">
                    <Heading>{t("version_nr", {versionNumber: version.versionNumber})}</Heading>
                    <Text as="span">
                        <Text fontWeight="semibold">{t("submitted")}:</Text>{" "}
                        {formatDate(version.submittedAt, i18n.language)}
                    </Text>
                </div>
            </Disclosure.Header>
            <Disclosure.Content>
                {/* Form data, questions and answers for each submission */}
                <div className="flex flex-col gap-6">
                    {version.submissions.map((submission) => {
                        const questions = submission.form.pages.flatMap((page) => page.questions);
                        const questionAnswerPairs = questions.map((question) => ({
                            question,
                            value: submission.answers.find((a) => a.questionName === question.name)
                                ?.value,
                        }));

                        return (
                            <div key={submission.id} className="flex flex-col gap-2">
                                <Heading as="h3" size="sm">
                                    {l(submission.form.title)}
                                </Heading>
                                <QuestionAnswerList
                                    questionAnswerPairs={questionAnswerPairs}
                                    noAnswerText={t("no_answer")}
                                />
                            </div>
                        );
                    })}
                </div>
            </Disclosure.Content>
        </Disclosure>
    );
};
