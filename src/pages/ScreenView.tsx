import {useState} from "react";

import {useParams} from "react-router";

import type {RowSelectionState} from "@tanstack/react-table";
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

import {HomePage, HomeRoleTabs} from "~/components/HomePage";
import {ScreenTable} from "~/components/ScreenTable";
import {BulkActionModal} from "~/components/ScreenTable/BulkActionModal";
import {filterScreenRows} from "~/components/ScreenTable/filterScreenRows";
import {ScreenTableToolbar} from "~/components/ScreenTable/ScreenTableToolbar.tsx";
import {useDocumentTitle} from "~/hooks/useDocumentTitle.ts";
import {useTranslate} from "~/hooks/useTranslate";
import {PersonalContent} from "~/pages/Personal";
import {useGetScreenQuery} from "~/store/api/screensApi";
import type {BulkAction, ScreenRow} from "~/store/api/types/screens";

function getScreenTabStorageKey(workflowDefinition = "", screenName = "") {
    return ["workflow", "screen", workflowDefinition, screenName, "active-tab"]
        .map(encodeURIComponent)
        .join(":");
}

export const ScreenView = () => {
    const {workflowDefinition, screenName} = useParams();
    return <ScreenContent key={`${workflowDefinition}:${screenName}`} />;
};

const ScreenContent = () => {
    const {l, i18n} = useTranslate("common");
    const {workflowDefinition, screenName} = useParams();
    const {currentData: screen, isFetching} = useGetScreenQuery(
        {workflowDefinition: workflowDefinition ?? "", screenName: screenName ?? ""},
        {skip: !workflowDefinition || !screenName},
    );
    const [search, setSearch] = useState("");
    const [rowSelection, setRowSelection] = useState<RowSelectionState>({});
    const [bulkSelection, setBulkSelection] = useState<{
        action: BulkAction;
        rows: ScreenRow[];
    } | null>(null);
    const {activeIndex: activeTab, onTabChange: setActiveTab} = useTabsWithLocalStorage({
        tabs: screen?.groups?.map((group) => group.name) ?? [],
        storageKey: getScreenTabStorageKey(workflowDefinition, screenName),
    });

    useDocumentTitle(screen ? l(screen.workflowDefinition.title) : null);

    const rows = screen?.groups?.[activeTab]?.rows ?? screen?.rows ?? [];
    const bulkActions = screen?.bulkActions ?? [];
    const selectedRows = filterScreenRows(
        screen?.columns ?? [],
        rows,
        search,
        i18n.language,
    ).filter((row) => rowSelection[row.id]);
    const toolbarBulkProps = {
        bulkActions,
        selectedCount: selectedRows.length,
        onBulkAction: (action: BulkAction) => setBulkSelection({action, rows: selectedRows}),
    };
    const selectionProps = bulkActions.length
        ? {rowSelection, onRowSelectionChange: setRowSelection}
        : {};
    const changeSearch = (value: string) => {
        setSearch(value);
        setRowSelection({});
    };

    if (!screen || !workflowDefinition || !screenName) {
        return isFetching ? (
            <HomePage title={null} isLoading>
                {null}
            </HomePage>
        ) : null;
    }

    const toolbar = (
        <ScreenTableToolbar
            search={search}
            setSearch={changeSearch}
            canEdit={screen.isBulkEditEnabled}
            canCreate={screen.workflowDefinition.canCreateInstance}
            workflowDefinition={workflowDefinition}
            {...toolbarBulkProps}
        />
    );
    const title = l(screen.workflowDefinition.title);
    return (
        <HomePage title={title}>
            <HomeRoleTabs
                coordinatorTabLabel={title}
                personalContent={<PersonalContent workflowDefinition={workflowDefinition} />}
            >
                <Card>
                    {screen.groups ? (
                        <Tabs
                            activeIndex={activeTab}
                            onTabChange={(index) => {
                                setActiveTab(index);
                                setRowSelection({});
                            }}
                        >
                            <TabList>
                                {screen.groups.map((group, index) => (
                                    <Tab key={group.name}>
                                        <div className="flex w-full justify-between gap-2">
                                            <span>{l(group.title)}</span>
                                            <Pill
                                                variant={activeTab === index ? "darkRed" : "grey"}
                                            >
                                                {group.rows.length}
                                            </Pill>
                                        </div>
                                    </Tab>
                                ))}
                            </TabList>
                            <TabToolbar className="py-4">{toolbar}</TabToolbar>
                            <TabPanels>
                                {screen.groups.map((group) => (
                                    <TabPanel key={group.name}>
                                        <ScreenTable
                                            columns={screen.columns}
                                            rows={group.rows}
                                            globalFilter={search}
                                            {...selectionProps}
                                        />
                                    </TabPanel>
                                ))}
                            </TabPanels>
                        </Tabs>
                    ) : (
                        <div className="flex flex-col gap-4">
                            {toolbar}
                            <ScreenTable
                                columns={screen.columns}
                                rows={screen.rows}
                                globalFilter={search}
                                {...selectionProps}
                            />
                        </div>
                    )}
                </Card>
                {bulkSelection && (
                    <BulkActionModal
                        workflowDefinition={workflowDefinition}
                        screenName={screenName}
                        action={bulkSelection.action}
                        columns={screen.columns}
                        rows={bulkSelection.rows}
                        onClose={() => setBulkSelection(null)}
                        onComplete={() => setRowSelection({})}
                    />
                )}
            </HomeRoleTabs>
        </HomePage>
    );
};
