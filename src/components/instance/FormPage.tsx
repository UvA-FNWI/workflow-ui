import {type ReactNode, useState} from "react";

import {useForm} from "react-hook-form";

import {skipToken} from "@reduxjs/toolkit/query";
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
import type {Form, Page} from "~/store/api/types/submissions";
import {isPageComplete as isPageCompleteUtil} from "~/utils/submissionUtils.ts";

export type FormPageSource =
    | {instanceId: string; submissionId: string; previousVersion?: number; previewForm?: never}
    | {previewForm: Form; instanceId?: never; submissionId?: never; previousVersion?: never};

type Props = FormPageSource & {
    onClose: () => void;
    renderLayout?: (content: ReactNode, actions: ReactNode) => ReactNode;
};

export const FormPage = ({
    instanceId,
    submissionId,
    onClose,
    previousVersion,
    previewForm,
    renderLayout,
}: Props) => {
    const {t, l} = useTranslate("workflow");
    const submissionKey = previewForm ? skipToken : {instanceId, submissionId};
    const {data: submission} = submissionsEndpoints.getSubmission.useQuery(submissionKey);
    const [selectedTabIndex, setActiveTabIndex] = useState(0);
    const previewInputs = useForm();
    const form = previewForm ?? submission?.form;

    if (!form) return renderLayout ? renderLayout(null, null) : <div>Loading...</div>;

    const pages = form.pages.filter((page) => page.isInCurrentForm);
    const showTabView = pages.length > 1; // only show tabs and summary when there is more than one page

    const isPageComplete = (page: Page) => !!submission && isPageCompleteUtil(page, submission);

    const areAllPagesComplete =
        !!submission && pages.filter((page) => page.isActive).every(isPageComplete);
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

    const renderPage = (page: Page, showTitle = true) =>
        previewForm ? (
            <PageControl
                page={page}
                showTitle={showTitle}
                preview={{layout: form.layout, inputs: previewInputs}}
            />
        ) : (
            <PageControl
                instanceId={instanceId}
                submissionId={submissionId}
                page={page}
                showTitle={showTitle}
            />
        );

    const actions = (
        <>
            {showTabView && previousTabIndex !== undefined && (
                <Button intent="secondary" onClick={() => setActiveTabIndex(previousTabIndex)}>
                    {t("previous")}
                </Button>
            )}
            {showTabView &&
            pages[activeTabIndex] &&
            (!previewForm || nextTabIndex !== undefined) ? (
                <Button
                    intent="primary"
                    disabled={
                        nextTabIndex === undefined ||
                        (!previewForm && !isPageComplete(pages[activeTabIndex]))
                    }
                    onClick={() => setActiveTabIndex(nextTabIndex ?? activeTabIndex)}
                >
                    {t("next")}
                </Button>
            ) : (
                !previewForm &&
                submission && (
                    <FormSubmitButton
                        instanceId={instanceId}
                        submission={submission}
                        disabled={!areAllPagesComplete}
                        onSubmit={onClose}
                    />
                )
            )}
        </>
    );

    const content = (
        <>
            {!previewForm && (
                <PrefilledAnswersNotice
                    instanceId={instanceId}
                    submissionId={submissionId}
                    previousVersion={previousVersion}
                />
            )}
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
                            ...(!previewForm
                                ? [
                                      <Tab key="summary" disabled={!areAllPagesComplete}>
                                          {t("instance.summary.title")}
                                      </Tab>,
                                  ]
                                : []),
                        ]}
                    </TabList>
                    <TabPanels>
                        {[
                            ...pages.map((page, index) => (
                                <TabPanel key={index}>
                                    <div className="my-4">{renderPage(page)}</div>
                                </TabPanel>
                            )),
                            ...(!previewForm && submission
                                ? [
                                      <TabPanel key="summary">
                                          <div className="flex flex-col gap-6 pt-4">
                                              {/* Summary of all pages */}
                                              <Heading size="sm">
                                                  {t("instance.summary.title")}
                                              </Heading>
                                              <FormSummary
                                                  submission={submission}
                                                  instanceId={instanceId}
                                                  onEditPage={onEditPage}
                                              />
                                          </div>
                                      </TabPanel>,
                                  ]
                                : []),
                        ]}
                    </TabPanels>
                </Tabs>
            ) : (
                pages[0]?.isActive && renderPage(pages[0], false)
            )}
        </>
    );

    return renderLayout ? (
        renderLayout(content, actions)
    ) : (
        <div>
            {content}
            <div className="mt-4 flex justify-start gap-3">{actions}</div>
        </div>
    );
};
