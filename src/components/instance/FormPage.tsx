import {useState} from "react";

import {Button, Heading, Tab, TabList, TabPanel, TabPanels, Tabs, Text} from "@datanose/ui";

import {PageControl} from "./PageControl";
import {FormSummary} from "~/components/instance/FormSummary.tsx";
import {useTranslate} from "~/hooks/useTranslate";
import {submissionsEndpoints} from "~/store/api/submissionsApi";
import {formatDate} from "~/utils/formatDate";

type Props = {
    instanceId: string;
    submissionId: string;
    onClose: () => void;
};

export const FormPage = ({instanceId, submissionId, onClose}: Props) => {
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
                                />
                                <div className="mt-4 flex justify-between gap-2">
                                    {activeTabIndex > 0 && (
                                        <Button intent="secondary" onClick={goToPreviousTab}>
                                            {t("go_back")}
                                        </Button>
                                    )}
                                    {activeTabIndex === 0 && (
                                        <Button intent="secondary" onClick={onClose}>
                                            {t("close")}
                                        </Button>
                                    )}
                                    <Button intent="secondary" onClick={goToNextTab}>
                                        {t("continue")}
                                    </Button>
                                </div>
                            </TabPanel>
                        )),
                        <TabPanel key="summary">
                            <div className="flex flex-col gap-6 pt-4">
                                {/* Summary of all pages */}
                                <Heading size="sm" className="uppercase" fontType="body">
                                    {t("instance.summary.title")}
                                </Heading>
                                <FormSummary
                                    submission={submission}
                                    instanceId={instanceId}
                                    onSubmit={onClose}
                                    onEditPage={setActiveTabIndex}
                                />
                            </div>
                        </TabPanel>,
                    ]}
                </TabPanels>
            </Tabs>
        </div>
    );
};
