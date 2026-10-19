import {useState} from "react";

import {useParams} from "react-router";

import {
    Card,
    Pill,
    Tab,
    TabList,
    TabPanel,
    TabPanels,
    Tabs,
    TabToolbar,
    useTabsWithLocalStorage,
} from "@uva-fnwi/datanose-ui";

import {HomePage} from "~/components/HomePage";
import {ScreenTable} from "~/components/ScreenTable";
import {ScreenTableToolbar} from "~/components/ScreenTable/ScreenTableToolbar.tsx";
import {useDocumentTitle} from "~/hooks/useDocumentTitle.ts";
import {useTranslate} from "~/hooks/useTranslate";
import {PersonalContent} from "~/pages/Personal";
import {useGetScreenQuery} from "~/store/api/screensApi";

function getScreenTabStorageKey(workflowDefinition = "", screenName = "") {
    return ["workflow", "screen", workflowDefinition, screenName, "active-tab"]
        .map(encodeURIComponent)
        .join(":");
}

export const ScreenView = () => {
    const {l} = useTranslate("common");
    const {workflowDefinition, screenName} = useParams();
    const {currentData: screen, isFetching} = useGetScreenQuery(
        {workflowDefinition: workflowDefinition ?? "", screenName: screenName ?? ""},
        {skip: !workflowDefinition || !screenName},
    );
    const [search, setSearch] = useState("");
    const {activeIndex: activeTab, onTabChange: setActiveTab} = useTabsWithLocalStorage({
        tabs: screen?.groups?.map((group) => group.name) ?? [],
        storageKey: getScreenTabStorageKey(workflowDefinition, screenName),
    });

    useDocumentTitle(screen ? l(screen.workflowDefinition.title) : null);

    if (!screen || !workflowDefinition) {
        return isFetching ? (
            <HomePage title={null} isLoading>
                {null}
            </HomePage>
        ) : null;
    }

    return (
        <HomePage
            title={l(screen.workflowDefinition.title)}
            coordinatorTabLabel={l(screen.workflowDefinition.title)}
            personalContent={<PersonalContent workflowDefinition={workflowDefinition} />}
        >
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
                            canCreate={screen.workflowDefinition.canCreateInstance}
                            workflowDefinition={workflowDefinition}
                        />
                        <ScreenTable
                            columns={screen.columns}
                            rows={screen.rows}
                            globalFilter={search}
                        />
                    </div>
                )}
            </Card>
        </HomePage>
    );
};
