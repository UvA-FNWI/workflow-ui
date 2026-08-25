import {useState} from "react";

import {useParams} from "react-router";

import {
    Card,
    Container,
    Heading,
    Pill,
    Tab,
    TabList,
    TabPanel,
    TabPanels,
    Tabs,
    TabToolbar,
} from "@uva-fnwi/datanose-ui";

import {ScreenTable} from "~/components/ScreenTable";
import {ScreenTableToolbar} from "~/components/ScreenTable/ScreenTableToolbar.tsx";
import {useDocumentTitle} from "~/hooks/useDocumentTitle.ts";
import {useTranslate} from "~/hooks/useTranslate";
import {useGetScreenQuery} from "~/store/api/screensApi";

export const ScreenView = () => {
    const {l} = useTranslate("common");
    const {workflowDefinition, screenName} = useParams();
    const {data: screen} = useGetScreenQuery(
        {workflowDefinition: workflowDefinition ?? "", screenName: screenName ?? ""},
        {skip: !workflowDefinition || !screenName},
    );
    const [search, setSearch] = useState("");
    const [activeTab, setActiveTab] = useState(0);

    useDocumentTitle(screen ? l(screen.workflowDefinition.title) : null);

    if (!screen) {
        return null;
    }

    return (
        <Container maxWidth={1280}>
            <Card>
                <div className="mb-4">
                    <div className="flex w-full flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                        <Heading as="h1" className="min-w-0 wrap-break-word">
                            {l(screen.workflowDefinition.title)}
                        </Heading>
                    </div>
                </div>
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
                            />
                        </TabToolbar>
                        <TabPanels>
                            {screen.groups.map((group) => (
                                <TabPanel key={group.name}>
                                    <ScreenTable
                                        columns={screen.columns}
                                        rows={group.rows}
                                        globalFilter={search}
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
                        />
                        <ScreenTable
                            columns={screen.columns}
                            rows={screen.rows}
                            globalFilter={search}
                        />
                    </div>
                )}
            </Card>
        </Container>
    );
};
