import {useState} from "react";

import {Button, Heading, Icon, Tab, TabList, TabPanel, TabPanels, Tabs} from "@datanose/ui";

import {PageControl} from "./PageControl";
import {FormSubmitButton} from "~/components/instance/FormSubmitButton.tsx";
import {FormSummary} from "~/components/instance/FormSummary.tsx";
import {useTranslate} from "~/hooks/useTranslate";
import {submissionsEndpoints} from "~/store/api/submissionsApi";
import type {Page} from "~/store/api/types/submissions";
import {isPageComplete as isPageCompleteUtil} from "~/utils/submissionUtils.ts";

type Props = {
    instanceId: string;
    submissionId: string;
    onClose: () => void;
};

export const FormPage = ({instanceId, submissionId, onClose}: Props) => {
    const {t, l} = useTranslate("workflow");
    const {data: submission} = submissionsEndpoints.getSubmission.useQuery({
        instanceId,
        submissionId,
    });
    const [activeTabIndex, setActiveTabIndex] = useState(0);

    if (!submission) return <div>Loading...</div>;

    const showTabView = submission.form.pages.length > 1; // only show tabs and summary when there is more than one page

    const totalTabs = submission.form.pages.length + 1; // +1 for summary tab

    const isPageComplete = (page: Page): boolean => isPageCompleteUtil(page, submission);

    const areAllPagesComplete = submission.form.pages.every((page) => isPageComplete(page));

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
            {showTabView ? (
                <Tabs activeIndex={activeTabIndex} onTabChange={setActiveTabIndex}>
                    <TabList>
                        {[
                            ...submission.form.pages.map((page, index) => (
                                <Tab key={index}>
                                    {l(page.title)}
                                    {isPageComplete(page) && (
                                        <Icon
                                            name="circle-checkmark-solid"
                                            size="xs"
                                            color="success"
                                            className="ml-1"
                                        />
                                    )}
                                </Tab>
                            )),
                            <Tab key="summary" disabled={!areAllPagesComplete}>
                                {t("instance.summary.title")}
                            </Tab>,
                        ]}
                    </TabList>
                    <TabPanels>
                        {[
                            ...submission.form.pages.map((page, index) => (
                                <TabPanel key={index}>
                                    <div className="mb-4 pt-4">
                                        <PageControl
                                            instanceId={instanceId}
                                            submissionId={submissionId}
                                            page={page}
                                        />
                                    </div>
                                    <div className="mt-4 flex justify-start gap-3">
                                        <Button
                                            intent="secondary"
                                            variant="destructive"
                                            onClick={goToPreviousTab}
                                            disabled={activeTabIndex === 0}
                                        >
                                            {t("go_back")}
                                        </Button>
                                        <Button
                                            intent="secondary"
                                            variant="destructive"
                                            disabled={
                                                index === submission.form.pages.length - 1
                                                    ? !areAllPagesComplete
                                                    : !isPageComplete(page)
                                            }
                                            onClick={goToNextTab}
                                        >
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
            ) : (
                <>
                    <div className="mb-4 pt-4">
                        <PageControl
                            instanceId={instanceId}
                            submissionId={submissionId}
                            page={submission.form.pages[0]}
                        />
                    </div>
                    <div className="mt-4">
                        <FormSubmitButton
                            instanceId={instanceId}
                            submission={submission}
                            disabled={!isPageComplete(submission.form.pages[0])}
                            onSubmit={onClose}
                        />
                    </div>
                </>
            )}
        </div>
    );
};
