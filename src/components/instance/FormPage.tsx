import {useState} from "react";

import {Button, Heading, Icon, Tab, TabList, TabPanel, TabPanels, Tabs} from "@datanose/ui";

import {PageControl} from "./PageControl";
import {FormSubmitButton} from "~/components/instance/FormSubmitButton.tsx";
import {FormSummary} from "~/components/instance/FormSummary.tsx";
import {useTranslate} from "~/hooks/useTranslate";
import {submissionsEndpoints} from "~/store/api/submissionsApi";
import type {Page} from "~/store/api/types/submissions";

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

    if (submission.form.formType === "AssessmentOverview") {
        return (
            <>
                <Heading size="sm" className="uppercase" fontType="body">
                    {t("instance.summary.title")}
                </Heading>
                <FormSummary
                    submission={submission}
                    instanceId={instanceId}
                    onSubmit={onClose}
                    onEditPage={() => {}}
                    formType="AssessmentOverview"
                />
            </>
        );
    }

    const showTabView = submission.form.pages.length > 1; // only show tabs and summary when there is more than one page

    const totalTabs = submission.form.pages.length + 1; // +1 for summary tab

    const isPageComplete = (page: Page): boolean =>
        page.questions
            .filter((q) => q.isRequired)
            .every((question) => {
                const answer = submission.answers.find((a) => a.questionName === question.name);
                return (
                    answer?.isVisible === false || (answer?.value != null && answer.value !== "")
                ); // only consider answers with a value and are visible
            });

    const areAllPagesComplete = submission.form.pages.every((page) => isPageComplete(page));

    // For some assessment forms not all tabs are enabled
    const goToNextEnabledTab = (current: number, direction: 1 | -1) => {
        const pages = submission.form.pages;

        const isEnabled = (i: number) =>
            i < pages.length ? pages[i].isInCurrentForm : i === pages.length && areAllPagesComplete;

        const nextIndex =
            Array.from({length: totalTabs}, (_, i) => i)
                .filter((i) => (direction === 1 ? i > current : i < current))
                .sort((a, b) => direction * (a - b))
                .find((i) => isEnabled(i)) ?? current;

        setActiveTabIndex(nextIndex);
    };

    return (
        <div>
            {showTabView ? (
                <Tabs activeIndex={activeTabIndex} onTabChange={setActiveTabIndex}>
                    <TabList>
                        {[
                            ...submission.form.pages.map((page, index) => (
                                <Tab key={index} disabled={!page.isInCurrentForm}>
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
                                    <PageControl
                                        instanceId={instanceId}
                                        submissionId={submissionId}
                                        page={page}
                                    />
                                    <div className="mt-4 flex justify-between gap-2">
                                        {activeTabIndex > 0 && (
                                            <Button
                                                intent="secondary"
                                                variant="destructive"
                                                onClick={() =>
                                                    goToNextEnabledTab(activeTabIndex, -1)
                                                }
                                            >
                                                {t("go_back")}
                                            </Button>
                                        )}
                                        {activeTabIndex === 0 && (
                                            <Button
                                                intent="secondary"
                                                variant="destructive"
                                                onClick={onClose}
                                            >
                                                {t("close")}
                                            </Button>
                                        )}
                                        <Button
                                            intent="secondary"
                                            variant="destructive"
                                            disabled={
                                                index === submission.form.pages.length - 1
                                                    ? !areAllPagesComplete
                                                    : !isPageComplete(page)
                                            }
                                            onClick={() => goToNextEnabledTab(activeTabIndex, 1)}
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
                    <PageControl
                        instanceId={instanceId}
                        submissionId={submissionId}
                        page={submission.form.pages[0]}
                    />
                    <FormSubmitButton
                        instanceId={instanceId}
                        submission={submission}
                        disabled={!isPageComplete(submission.form.pages[0])}
                        onSubmit={onClose}
                    />
                </>
            )}
        </div>
    );
};
