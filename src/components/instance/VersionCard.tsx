import {Disclosure, Heading, Text} from "@datanose/ui";

import {useTranslate} from "~/hooks/useTranslate.ts";
import type {WorkflowStepVersion} from "~/store/api/types/instances";
import type {Submission} from "~/store/api/types/submissions.ts";
import {formatAnswer} from "~/utils/formatAnswer.ts";
import {formatDate} from "~/utils/formatDate.ts";

type Props = {
    version: WorkflowStepVersion;
    submissions: Submission[];
};

export const VersionCard = ({version, submissions}: Props) => {
    const {t, l, i18n} = useTranslate("workflow", {keyPrefix: "version_card"});

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
                    {Object.entries(version.formData).map(([questionName, value]) => {
                        // Find the question definition
                        const question = allQuestions.find((q) => q.name === questionName);

                        if (!question) {
                            // If we can't find the question, show raw data
                            return (
                                <div key={questionName} className="grid grid-cols-2 gap-4">
                                    <Text>{questionName}</Text>
                                    <Text>{value != null ? String(value) : t("no_answer")}</Text>
                                </div>
                            );
                        }

                        // Format the value based on question type
                        const formattedValue =
                            value != null
                                ? formatAnswer(value, question.type, i18n.language)
                                : t("no_answer");

                        return (
                            <div key={questionName} className="grid grid-cols-2 gap-4">
                                <Text>{l(question.text)}</Text>
                                <Text>{formattedValue}</Text>
                            </div>
                        );
                    })}
                </div>
            </Disclosure.Content>
        </Disclosure>
    );
};
