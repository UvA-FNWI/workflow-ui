import {Disclosure, Heading, Text} from "@uva-fnwi/datanose-ui";

import {QuestionAnswerList} from "./QuestionAnswerList.tsx";
import {useTranslate} from "~/hooks/useTranslate.ts";
import type {WorkflowStepVersion} from "~/store/api/types/instances";
import {formatDate} from "~/utils/formatDate.ts";
import {getVisibleQuestionAnswerPairs} from "~/utils/submissionUtils.ts";

type Props = {
    version: WorkflowStepVersion;
    instanceId: string;
};

export const VersionCard = ({version, instanceId}: Props) => {
    const {t, l, i18n} = useTranslate("workflow");

    return (
        <Disclosure key={version.versionNumber}>
            <Disclosure.Header>
                <div className="flex w-full items-center justify-between">
                    <Heading>
                        {t("version_card.version_nr", {versionNumber: version.versionNumber})}
                    </Heading>
                    <Text as="span">
                        <Text fontWeight="semibold">{t("status.submitted")}:</Text>{" "}
                        {formatDate(version.submittedAt, i18n.language)}
                    </Text>
                </div>
            </Disclosure.Header>
            <Disclosure.Content>
                {/* Form data, questions and answers for each submission */}
                <div className="flex flex-col gap-6">
                    {version.submissions.map((submission) => (
                        <div key={submission.id} className="flex flex-col gap-2">
                            {submission.form.pages.map((page) => {
                                const questionAnswerPairs = getVisibleQuestionAnswerPairs(
                                    page.questions,
                                    submission.answers,
                                );

                                return (
                                    <div key={page.name} className="py-2">
                                        {submission.form.pages.length > 1 && (
                                            <Heading size="xs" className="pb-1 font-semibold">
                                                {l(page.title)}
                                            </Heading>
                                        )}
                                        <QuestionAnswerList
                                            questionAnswerPairs={questionAnswerPairs}
                                            noAnswerText={t("version_card.no_answer")}
                                            instanceId={instanceId}
                                            submissionId={submission.id}
                                        />
                                    </div>
                                );
                            })}
                        </div>
                    ))}
                </div>
            </Disclosure.Content>
        </Disclosure>
    );
};
