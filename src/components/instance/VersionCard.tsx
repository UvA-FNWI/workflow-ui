import {Disclosure, Heading, Text} from "@datanose/ui";

import {QuestionAnswerList} from "./QuestionAnswerList.tsx";
import {useTranslate} from "~/hooks/useTranslate.ts";
import type {WorkflowStepVersion} from "~/store/api/types/instances";
import type {Submission} from "~/store/api/types/submissions.ts";
import {formatDate} from "~/utils/formatDate.ts";

type Props = {
    version: WorkflowStepVersion;
    submissions: Submission[];
};

export const VersionCard = ({version, submissions}: Props) => {
    const {t, i18n} = useTranslate("workflow", {keyPrefix: "version_card"});

    const submission = submissions[0]; // Assuming all submissions for this step share the same form structure
    const allQuestions = submission ? submission.form.pages.flatMap((page) => page.questions) : [];
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
                {/* Form data - questions and answers */}
                <div className="flex flex-col gap-2">
                    <QuestionAnswerList
                        questionAnswerPairs={Object.entries(version.formData)
                            .map(([questionName, value]) => {
                                const question = allQuestions.find((q) => q.name === questionName);
                                return question ? {question, value} : null;
                            })
                            .filter((pair) => pair !== null)}
                        noAnswerText={t("no_answer")}
                    />
                    {/* Show questions that weren't found in the form definition */}
                    {Object.entries(version.formData).map(([questionName, value]) => {
                        const question = allQuestions.find((q) => q.name === questionName);
                        if (question) return null;

                        return (
                            <div key={questionName} className="grid grid-cols-2 gap-4">
                                <Text>{questionName}</Text>
                                <Text>{value != null ? String(value) : t("no_answer")}</Text>
                            </div>
                        );
                    })}
                </div>
            </Disclosure.Content>
        </Disclosure>
    );
};
