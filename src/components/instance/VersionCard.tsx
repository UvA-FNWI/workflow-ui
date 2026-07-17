import {Disclosure, Heading, Text} from "@uva-fnwi/datanose-ui";

import {QuestionAnswerList} from "./QuestionAnswerList.tsx";
import {useTranslate} from "~/hooks/useTranslate.ts";
import type {WorkflowStepVersion} from "~/store/api/types/instances";
import {formatDateShort} from "~/utils/formatDate.ts";
import {getVisibleQuestionAnswerPairs} from "~/utils/submissionUtils.ts";

type Props = {
    version: WorkflowStepVersion;
    instanceId: string;
    isExpandedByDefault?: boolean;
};

export const VersionCard = ({version, instanceId, isExpandedByDefault}: Props) => {
    const {t, l, i18n} = useTranslate("workflow");

    return (
        <Disclosure
            key={version.versionNumber}
            border="none"
            shadow="none"
            defaultExpanded={isExpandedByDefault}
        >
            <Disclosure.Header nested={true}>
                <div className="flex w-full flex-col items-start gap-2 sm:flex-row sm:items-center sm:justify-between">
                    <Heading fontType="heading" className="text-lg font-semibold">
                        {t("version_card.version_nr", {versionNumber: version.versionNumber})}
                    </Heading>
                    <Text as="span">
                        <Text fontWeight="semibold">{t("status.submitted")}:</Text>{" "}
                        {formatDateShort(version.submittedAt, i18n.language)}
                    </Text>
                </div>
            </Disclosure.Header>
            <Disclosure.Content padding="none">
                {/* Form data, questions and answers for each submission */}
                <div className="flex flex-col gap-6">
                    {version.submissions.map((submission, index) => (
                        <div key={submission.id} className="flex flex-col gap-2">
                            {version.submissions.length > 1 && index > 0 && (
                                <Heading
                                    as="h4"
                                    size="xs"
                                    className="pb-1 font-semibold text-red-brand"
                                >
                                    {l(submission.form.title)?.toUpperCase()}
                                </Heading>
                            )}
                            {submission.form.pages.map((page) => {
                                const questionAnswerPairs = getVisibleQuestionAnswerPairs(
                                    page.questions,
                                    submission.answers,
                                );

                                return (
                                    <div key={page.name} className="py-2">
                                        {submission.form.pages.length > 1 && (
                                            <Heading
                                                size="xs"
                                                as="h4"
                                                className="pb-2 font-semibold"
                                            >
                                                {l(page.title)?.toUpperCase()}
                                            </Heading>
                                        )}
                                        <QuestionAnswerList
                                            questionAnswerPairs={questionAnswerPairs}
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
