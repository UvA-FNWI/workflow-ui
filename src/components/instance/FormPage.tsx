import {useState} from "react";

import {Button, Heading, Icon, Tab, TabList, TabPanel, TabPanels, Tabs, Text} from "@datanose/ui";

import {PageControl} from "./PageControl";
import {useTranslate} from "~/hooks/useTranslate";
import {submissionsEndpoints} from "~/store/api/submissionsApi";
import type {Action} from "~/store/api/types/instances";
import {formatAnswer} from "~/utils/formatAnswer";
import {formatDate} from "~/utils/formatDate";

export const FormPage = ({
    instanceId,
    submissionId,
    actions,
    setActiveAction,
}: {
    instanceId: string;
    submissionId: string;
    actions: Action[];
    setActiveAction: React.Dispatch<React.SetStateAction<Action | null>>;
}) => {
    const {i18n, t, l} = useTranslate("workflow");
    const {data: submission} = submissionsEndpoints.getSubmission.useQuery({
        instanceId,
        submissionId,
    });
    const [activeTabIndex, setActiveTabIndex] = useState(0);

    const formattedDate =
        (submission?.dateSubmitted && formatDate(submission.dateSubmitted, i18n.language)) ?? "";

    if (!submission) return <div>Loading...</div>;

    const totalTabs = submission.form.pages.length + 1; // +1 for summary tab

    const goToNextTab = () => {
        if (activeTabIndex < totalTabs - 1) {
            setActiveTabIndex(activeTabIndex + 1);
        }
    };

    const goToPreviousTab = () => {
        if (activeTabIndex > 0) {
            setActiveTabIndex(activeTabIndex - 1);
        }
    };

    return (
        <div>
            {submission.dateSubmitted && (
                <Text className="mb-2">
                    {t("instance.submission.submittedOn", {date: formattedDate})}
                </Text>
            )}

            <Tabs activeIndex={activeTabIndex} onTabChange={setActiveTabIndex}>
                <TabList>
                    {[
                        ...submission.form.pages.map((page, index) => (
                            <Tab key={index}>{l(page.title)}</Tab>
                        )),
                        <Tab key="summary">{t("instance.summary.title")}</Tab>,
                    ]}
                </TabList>
                <TabPanels>
                    {[
                        ...submission.form.pages.map((page, index) => (
                            <TabPanel key={index}>
                                <PageControl
                                    instanceId={instanceId}
                                    submissionId={submissionId}
                                    page={page}
                                    currentTabIndex={activeTabIndex}
                                    onNext={goToNextTab}
                                    onPrevious={goToPreviousTab}
                                />
                            </TabPanel>
                        )),
                        <TabPanel key="summary">
                            <div className="flex flex-col gap-6 pt-4">
                                {/* Summary of all pages */}
                                <Heading size="sm" className="uppercase" fontType="body">
                                    {t("instance.summary.title")}
                                </Heading>
                                <div className="flex flex-col gap-6">
                                    {submission.form.pages.map((page, index) => (
                                        <div key={index} className="flex flex-col gap-3">
                                            {/* Page title with edit button */}
                                            <div className="flex items-center gap-1">
                                                <Text fontWeight="bold" size="lg">
                                                    {l(page.title)}
                                                </Text>
                                                <Button
                                                    intent="ghost"
                                                    size="small"
                                                    shape="circular"
                                                    className="ui:border-0 ui:hover:enabled:bg-grey-100 ui:dark:hover:enabled:bg-grey-800"
                                                    onClick={() => setActiveTabIndex(index)}
                                                    rightIcon={
                                                        <Icon
                                                            name="edit-line"
                                                            size="xs"
                                                            color="danger"
                                                        />
                                                    }
                                                    aria-label={t("instance.summary.edit_page", {
                                                        pageTitle: l(page.title),
                                                    })}
                                                ></Button>
                                            </div>

                                            {/* Questions and answers */}
                                            <div className="flex flex-col gap-2">
                                                {page.questions.map((question) => {
                                                    const answer = submission.answers.find(
                                                        (a) => a.questionName === question.name,
                                                    );

                                                    const formattedValue =
                                                        answer?.value != null
                                                            ? formatAnswer(
                                                                  answer.value,
                                                                  question.type,
                                                                  i18n.language,
                                                              )
                                                            : t("instance.summary.no_answer");

                                                    return (
                                                        <div
                                                            key={question.name}
                                                            className="grid grid-cols-2 gap-4"
                                                        >
                                                            <Text>{l(question.text)}</Text>
                                                            <Text>{formattedValue}</Text>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                {/* Action buttons */}
                                <div className="flex gap-2 pt-2">
                                    {actions.map((a) => (
                                        <Button
                                            key={a.id}
                                            onClick={() =>
                                                a.type === "Execute" && setActiveAction(a)
                                            }
                                            intent={
                                                a.intent === "Destructive" ? "primary" : "secondary"
                                            }
                                        >
                                            {l(a.title)}
                                        </Button>
                                    ))}
                                </div>
                            </div>
                        </TabPanel>,
                    ]}
                </TabPanels>
            </Tabs>
        </div>
    );
};
