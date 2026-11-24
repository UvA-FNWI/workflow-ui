import {type ReactElement, type ReactNode} from "react";

import {useOutletContext} from "react-router";

import {Container, Tab, TabList, TabPanel, TabPanels, Tabs} from "@uva-fnwi/datanose-ui";

import type {HomeLayoutContext} from "~/components/HomeLayout";
import {PageHeader} from "~/components/PageHeader";
import {useTranslate} from "~/hooks/useTranslate";

type HomePageProps = {
    title: ReactNode;
    coordinatorTabLabel?: ReactNode;
    personalContent?: ReactNode;
    isLoading?: boolean;
    toolbar?: ReactNode;
    alternateContent?: ReactElement;
    children: ReactNode;
};

export function HomePage({
    title,
    coordinatorTabLabel,
    personalContent,
    isLoading = false,
    toolbar,
    alternateContent,
    children,
}: HomePageProps) {
    const navigation = useOutletContext<HomeLayoutContext | undefined>();
    const {t} = useTranslate("workflow");
    const showRoleTabs = navigation?.showRoleTabs;
    const body = showRoleTabs ? (
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

    return (
        <Container maxWidth={1280}>
            <PageHeader
                title={title}
                backLabel={navigation?.showBackToChoices ? t("home") : undefined}
                backTo="/"
                className={showRoleTabs ? "mb-2" : undefined}
                isLoading={isLoading}
            />
            {!isLoading && (
                <>
                    {toolbar}
                    <div hidden={alternateContent !== undefined}>{body}</div>
                    {alternateContent}
                </>
            )}
        </Container>
    );
}
