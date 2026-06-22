import {useState} from "react";

import {
    Button,
    Heading,
    Icon,
    Tab,
    TabList,
    TabPanel,
    TabPanels,
    Tabs,
} from "@uva-fnwi/datanose-ui";

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

    const pages = submission.form.pages.filter((p) => p.isInCurrentForm);

    // For some assessment forms not all tabs are enabled
    const goToNextEnabledTab = (current: number, direction: 1 | -1) => {
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
                            ...pages.map((page, index) => (
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
                            ...pages.map((page, index) => (
                                <TabPanel key={index}>
                                    <div className="my-4">
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
                                            onClick={() => goToNextEnabledTab(activeTabIndex, -1)}
                                            disabled={activeTabIndex === 0}
                                        >
                                            {t("previous")}
                                        </Button>
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
                                            {t("next")}
                                        </Button>
                                    </div>
                                </TabPanel>
                            )),
                            <TabPanel key="summary">
                                <div className="flex flex-col gap-6 pt-4">
                                    {/* Summary of all pages */}
                                    <Heading size="sm">{t("instance.summary.title")}</Heading>
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
