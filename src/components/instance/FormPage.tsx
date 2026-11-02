import {type ReactNode, useState} from "react";

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
import {PrefilledAnswersNotice} from "~/components/instance/PrefilledAnswersNotice.tsx";
import {useTranslate} from "~/hooks/useTranslate";
import {submissionsEndpoints} from "~/store/api/submissionsApi";
import type {Page} from "~/store/api/types/submissions";
import {isPageComplete as isPageCompleteUtil} from "~/utils/submissionUtils.ts";

type Props = {
    instanceId: string;
    submissionId: string;
    onClose: () => void;
    previousVersion?: number;
    renderLayout?: (content: ReactNode, actions: ReactNode) => ReactNode;
};

export const FormPage = ({
    instanceId,
    submissionId,
    onClose,
    previousVersion,
    renderLayout,
}: Props) => {
    const {t, l} = useTranslate("workflow");
    const {data: submission} = submissionsEndpoints.getSubmission.useQuery({
        instanceId,
        submissionId,
    });
    const [selectedTabIndex, setActiveTabIndex] = useState(0);

    if (!submission) return renderLayout ? renderLayout(null, null) : <div>Loading...</div>;

    const pages = submission.form.pages.filter((page) => page.isInCurrentForm);
    const showTabView = pages.length > 1; // only show tabs and summary when there is more than one page

    const isPageComplete = (page: Page): boolean => isPageCompleteUtil(page, submission);

    const areAllPagesComplete = pages.filter((page) => page.isActive).every(isPageComplete);
    const firstActivePage = pages.findIndex((page) => page.isActive);
    const activeTabIndex =
        pages[selectedTabIndex]?.isActive ||
        (selectedTabIndex === pages.length && areAllPagesComplete)
            ? selectedTabIndex
            : firstActivePage === -1
              ? pages.length
              : firstActivePage;

    const enabledTabs = pages.flatMap((page, index) => (page.isActive ? [index] : []));
    if (areAllPagesComplete) enabledTabs.push(pages.length);
    const currentIndex = enabledTabs.indexOf(activeTabIndex);
    const previousTabIndex = enabledTabs[currentIndex - 1];
    const nextTabIndex = enabledTabs[currentIndex + 1];

    const onEditPage = (pageName: string) => {
        const tabIndex = pages.findIndex((p) => p.name === pageName);
        if (tabIndex !== -1) setActiveTabIndex(tabIndex);
    };

    const actions = (
        <>
            {showTabView && previousTabIndex !== undefined && (
                <Button intent="secondary" onClick={() => setActiveTabIndex(previousTabIndex)}>
                    {t("previous")}
                </Button>
            )}
            {showTabView && activeTabIndex !== pages.length ? (
                <Button
                    intent="primary"
                    disabled={nextTabIndex === undefined || !isPageComplete(pages[activeTabIndex])}
                    onClick={() => setActiveTabIndex(nextTabIndex ?? activeTabIndex)}
                >
                    {t("next")}
                </Button>
            ) : (
                <FormSubmitButton
                    instanceId={instanceId}
                    submission={submission}
                    disabled={!areAllPagesComplete}
                    onSubmit={onClose}
                />
            )}
        </>
    );

    const content = (
        <>
            <PrefilledAnswersNotice
                instanceId={instanceId}
                submissionId={submissionId}
                previousVersion={previousVersion}
            />
            {showTabView ? (
                <Tabs activeIndex={activeTabIndex} onTabChange={setActiveTabIndex}>
                    <TabList>
                        {[
                            ...pages.map((page, index) => (
                                <Tab key={index} disabled={!page.isActive}>
                                    <span className={!page.isActive ? "line-through" : ""}>
                                        {l(page.title)}
                                    </span>
                                    {page.isActive && isPageComplete(page) && (
                                        <Icon
                                            name="circle-checkmark-solid"
                                            size="sm"
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
                                </TabPanel>
                            )),
                            <TabPanel key="summary">
                                <div className="flex flex-col gap-6 pt-4">
                                    {/* Summary of all pages */}
                                    <Heading size="sm">{t("instance.summary.title")}</Heading>
                                    <FormSummary
                                        submission={submission}
                                        instanceId={instanceId}
                                        onEditPage={onEditPage}
                                    />
                                </div>
                            </TabPanel>,
                        ]}
                    </TabPanels>
                </Tabs>
            ) : (
                pages[0]?.isActive && (
                    <PageControl
                        instanceId={instanceId}
                        submissionId={submissionId}
                        page={pages[0]}
                        showTitle={false}
                    />
                )
            )}
        </>
    );

    return renderLayout ? (
        renderLayout(content, actions)
    ) : (
        <div>
            {content}
            <div className="mt-4 flex justify-end gap-3">{actions}</div>
        </div>
    );
};
