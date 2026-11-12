import {type ReactNode} from "react";

import {useOutletContext} from "react-router";

import {Container, Tab, TabList, TabPanel, TabPanels, Tabs} from "@uva-fnwi/datanose-ui";

import type {HomeLayoutContext} from "~/components/HomeLayout";
import {HomeSearch} from "~/components/HomeSearch";
import {PageHeader} from "~/components/PageHeader";
import type {WorkflowScreen} from "~/components/WorkflowScreenLink";
import {useTranslate} from "~/hooks/useTranslate";

type HomePageProps = {
    title: ReactNode;
    description?: ReactNode;
    coordinatorTabLabel?: ReactNode;
    personalContent?: ReactNode;
    searchScreens?: WorkflowScreen[];
    maxWidth?: number;
    isLoading?: boolean;
    children: ReactNode;
};

export function HomePage({
    title,
    description,
    coordinatorTabLabel,
    personalContent,
    searchScreens,
    maxWidth = 1280,
    isLoading = false,
    children,
}: HomePageProps) {
    const navigation = useOutletContext<HomeLayoutContext | undefined>();
    const {t} = useTranslate("workflow");
    const showRoleTabs = navigation?.showRoleTabs;
    const content = showRoleTabs ? (
        <Tabs activeIndex={navigation.activeTab} onTabChange={navigation.onTabChange}>
            <TabList className="mb-6">
                <Tab>{coordinatorTabLabel ?? t("overview.coordinator_view")}</Tab>
                <Tab>{t("overview.personal_view")}</Tab>
            </TabList>
            <TabPanels>
                <TabPanel>{children}</TabPanel>
                <TabPanel>{personalContent ?? children}</TabPanel>
            </TabPanels>
        </Tabs>
    ) : (
        children
    );

    const renderHeader = (searching = false) => (
        <PageHeader
            title={searching ? t("home_search.title") : title}
            description={description}
            backLabel={navigation?.showBackToChoices ? t("home") : undefined}
            backTo="/"
            className={showRoleTabs ? "mb-2" : undefined}
            isLoading={isLoading}
        />
    );

    return (
        <Container maxWidth={maxWidth}>
            {!isLoading && searchScreens ? (
                <HomeSearch workflowScreens={searchScreens} renderHeader={renderHeader}>
                    {content}
                </HomeSearch>
            ) : (
                <>
                    {renderHeader()}
                    {!isLoading && content}
                </>
            )}
        </Container>
    );
}
