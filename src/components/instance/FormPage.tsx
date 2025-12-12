import {useState} from "react";

import {Button, Icon, Tab, TabList, TabPanel, TabPanels, Tabs, Text} from "@datanose/ui";

import {PageControl} from "./PageControl";
import {useTranslate} from "~/hooks/useTranslate";
import {submissionsEndpoints} from "~/store/api/submissionsApi";
import type {Action} from "~/store/api/types/instances";
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
            {/* QUESTION: Does this need to be displayed here? Or somewhere else? */}
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
                        <Tab key="summary">{t("instance.summary")}</Tab>,
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
                            <div className="flex flex-col gap-4">
                                {/* Summary of all pages */}
                                <div className="mb-6 flex flex-col gap-3">
                                    {submission.form.pages.map((page, index) => (
                                        <div key={index} className="flex gap-1">
                                            <Text fontWeight="bold" size="md">
                                                {l(page.title)}
                                            </Text>
                                            <Button
                                                intent="ghost"
                                                size="small"
                                                onClick={() => setActiveTabIndex(index)}
                                                rightIcon={
                                                    <Icon
                                                        name="edit-line"
                                                        size="xs"
                                                        color="danger"
                                                    />
                                                }
                                            ></Button>
                                        </div>
                                    ))}
                                </div>

                                {/* Action buttons */}
                                <div className="flex gap-2">
                                    {actions.map((a) => (
                                        <Button
                                            key={a.id}
                                            onClick={() =>
                                                a.type === "Execute" && setActiveAction(a)
                                            }
                                            intent={
                                                a.intent === "Destructive"
                                                    ? "destructivePrimary"
                                                    : "secondary"
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
