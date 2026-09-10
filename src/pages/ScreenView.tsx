import {useState} from "react";

import {useParams} from "react-router";

import {
    Card,
    Container,
    Pill,
    Tab,
    TabList,
    TabPanel,
    TabPanels,
    Tabs,
    TabToolbar,
} from "@uva-fnwi/datanose-ui";

import {PageHeader} from "~/components/PageHeader";
import {ScreenTable} from "~/components/ScreenTable";
import {ScreenTableToolbar} from "~/components/ScreenTable/ScreenTableToolbar.tsx";
import {useDocumentTitle} from "~/hooks/useDocumentTitle.ts";
import {useTranslate} from "~/hooks/useTranslate";
import {useGetScreenQuery} from "~/store/api/screensApi";
import type {FromScreen} from "~/utils/overviewEntries";

export const ScreenView = () => {
    const {l, t} = useTranslate("workflow");
    const {workflowDefinition, screenName} = useParams();
    const {data: screen} = useGetScreenQuery(
        {workflowDefinition: workflowDefinition ?? "", screenName: screenName ?? ""},
        {skip: !workflowDefinition || !screenName},
    );
    const [search, setSearch] = useState("");
    const [activeTab, setActiveTab] = useState(0);

    const title = screen ? l(screen.title) || l(screen.workflowDefinition.title) : null;
    useDocumentTitle(title);

    if (!screen || !workflowDefinition || !screenName) {
        return null;
    }

    const fromScreen: FromScreen = {
        workflowDefinition,
        screenName,
        title: screen.title,
    };

    return (
        <Container maxWidth={1280}>
            <PageHeader title={title ?? workflowDefinition} backLabel={t("home")} backTo="/" />
            <Card>
                {screen.groups ? (
                    <Tabs activeIndex={activeTab} onTabChange={setActiveTab}>
                        <TabList>
                            {screen.groups.map((group, index) => (
                                <Tab key={group.name}>
                                    <div className="flex w-full justify-between gap-2">
                                        <span>{l(group.title)}</span>
                                        <Pill variant={activeTab === index ? "darkRed" : "grey"}>
                                            {group.rows.length}
                                        </Pill>
                                    </div>
                                </Tab>
                            ))}
                        </TabList>
                        <TabToolbar className="py-4">
                            <ScreenTableToolbar
                                search={search}
                                setSearch={setSearch}
                                canEdit={screen.isBulkEditEnabled}
                                canCreate={screen.workflowDefinition.canCreateInstance}
                                workflowDefinition={workflowDefinition}
                                fromScreen={fromScreen}
                            />
                        </TabToolbar>
                        <TabPanels>
                            {screen.groups.map((group) => (
                                <TabPanel key={group.name}>
                                    <ScreenTable
                                        columns={screen.columns}
                                        rows={group.rows}
                                        globalFilter={search}
                                        fromScreen={fromScreen}
                                    />
                                </TabPanel>
                            ))}
                        </TabPanels>
                    </Tabs>
                ) : (
                    <div className="flex flex-col gap-4">
                        <ScreenTableToolbar
                            search={search}
                            setSearch={setSearch}
                            canEdit={screen.isBulkEditEnabled}
                            canCreate={screen.workflowDefinition.canCreateInstance}
                            workflowDefinition={workflowDefinition}
                            fromScreen={fromScreen}
                        />
                        <ScreenTable
                            columns={screen.columns}
                            rows={screen.rows}
                            globalFilter={search}
                            fromScreen={fromScreen}
                        />
                    </div>
                )}
            </Card>
        </Container>
    );
};
