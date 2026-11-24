import {type ComponentProps, useMemo, useState} from "react";

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
    useTabsWithLocalStorage,
} from "@uva-fnwi/datanose-ui";

import {HomePage} from "~/components/HomePage";
import {ScreenTable} from "~/components/ScreenTable";
import {BulkActionModal} from "~/components/ScreenTable/BulkActionModal";
import {ScreenTableToolbar} from "~/components/ScreenTable/ScreenTableToolbar.tsx";
import {useScreenFilters} from "~/components/ScreenTable/useScreenFilters.ts";
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
    const {l} = useTranslate("screens");
    const {workflowDefinition, screenName} = useParams();
    const {currentData: screen, isFetching} = useGetScreenQuery(
        {workflowDefinition: workflowDefinition ?? "", screenName: screenName ?? ""},
        {skip: !workflowDefinition || !screenName},
    );
    const [rowSelection, setRowSelection] = useState<RowSelectionState>({});
    const [bulkSelection, setBulkSelection] = useState<{
        action: BulkAction;
        rows: ScreenRow[];
    } | null>(null);
    const {activeIndex: activeTab, onTabChange: setActiveTab} = useTabsWithLocalStorage({
        tabs: screen?.groups?.map((group) => group.name) ?? [],
        storageKey: getScreenTabStorageKey(workflowDefinition, screenName),
    });
    const columns = useMemo(() => screen?.columns ?? [], [screen]);
    const {
        search,
        setSearch,
        columnFilters,
        setColumnFilter,
        clearColumnFilters,
        pickTypeFilters,
        isFiltering,
        filteredGroupRows,
    } = useScreenFilters({
        columns,
        rows: screen?.rows,
        groups: screen?.groups,
    });

    useDocumentTitle(screen ? l(screen.workflowDefinition.title) : null);

    const bulkActions = screen?.bulkActions ?? [];
    const selectedRows = useMemo(() => {
        const allRows = screen?.groups
            ? screen.groups.flatMap((group) => group.rows)
            : (screen?.rows ?? []);
        return allRows.filter((row) => rowSelection[row.id]);
    }, [screen, rowSelection]);

    const hiddenSelectedCount = useMemo(() => {
        const visibleIds = new Set(filteredGroupRows.flat().map((row) => row.id));
        return selectedRows.filter((row) => !visibleIds.has(row.id)).length;
    }, [filteredGroupRows, selectedRows]);

    const toolbarBulkProps = {
        bulkActions,
        selectedCount: selectedRows.length,
        onBulkAction: (action: BulkAction) => setBulkSelection({action, rows: selectedRows}),
    } satisfies Partial<ComponentProps<typeof ScreenTableToolbar>>;

    const filterProps = {
        filters: pickTypeFilters,
        filterValues: columnFilters,
        onFilterChange: setColumnFilter,
        onClearFilters: clearColumnFilters,
    } satisfies Partial<ComponentProps<typeof ScreenTableToolbar>>;

    const selectionProps = bulkActions.length
        ? {rowSelection, onRowSelectionChange: setRowSelection}
        : {};

    if (!screen || !workflowDefinition || !screenName) {
        return isFetching ? (
            <HomePage title={null} isLoading>
                {null}
            </HomePage>
        ) : null;
    }

    const title = l(screen.workflowDefinition.title);
    return (
        <HomePage
            title={title}
            coordinatorTabLabel={title}
            personalContent={<PersonalContent workflowDefinition={workflowDefinition} />}
        >
            <Card>
                <ScreenTableToolbar
                    search={search}
                    setSearch={setSearch}
                    canEdit={screen.isBulkEditEnabled}
                    canCreate={screen.workflowDefinition.canCreateInstance}
                    workflowDefinition={workflowDefinition}
                    {...toolbarBulkProps}
                    {...filterProps}
                />
                {screen.groups ? (
                    <Tabs activeIndex={activeTab} onTabChange={(index) => setActiveTab(index)}>
                        <TabList className="my-4">
                            {screen.groups.map((group, index) => (
                                <Tab key={group.name}>
                                    <div className="flex w-full justify-between gap-2">
                                        <span>{l(group.title)}</span>
                                        <Pill variant={activeTab === index ? "darkRed" : "grey"}>
                                            {isFiltering
                                                ? `${filteredGroupRows[index].length}/${group.rows.length}`
                                                : group.rows.length}
                                        </Pill>
                                    </div>
                                </Tab>
                            ))}
                        </TabList>
                        <TabPanels>
                            {screen.groups.map((group, index) => (
                                <TabPanel key={group.name}>
                                    <ScreenTable
                                        columns={screen.columns}
                                        rows={filteredGroupRows[index]}
                                        {...selectionProps}
                                    />
                                </TabPanel>
                            ))}
                        </TabPanels>
                    </Tabs>
                ) : (
                    <ScreenTable
                        columns={screen.columns}
                        rows={filteredGroupRows[0]}
                        {...selectionProps}
                    />
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
                    hiddenSelectedCount={hiddenSelectedCount}
                />
            )}
        </HomePage>
    );
};
