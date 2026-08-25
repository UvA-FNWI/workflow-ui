import {useState} from "react";

import {useParams} from "react-router";

import {
    Button,
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
import {useVersionedNavigate} from "~/hooks/useVersionedNavigate";
import {useCreateInstanceMutation} from "~/store/api/instancesApi";
import {useGetScreenQuery} from "~/store/api/screensApi";

export const ScreenView = () => {
    const {l} = useTranslate("common");
    const {workflowDefinition, screenName} = useParams();
    const navigate = useVersionedNavigate();
    const {data: screen} = useGetScreenQuery(
        {workflowDefinition: workflowDefinition ?? "", screenName: screenName ?? ""},
        {skip: !workflowDefinition || !screenName},
    );
    const [search, setSearch] = useState("");
    const [activeTab, setActiveTab] = useState(0);
    const [createInstance, {isLoading: isCreating}] = useCreateInstanceMutation();

    const handleCreate = async () => {
        if (!workflowDefinition) return;
        const result = await createInstance({workflowDefinition});
        if (result.data) {
            navigate(`/instance/${result.data.id}`);
        }
    };

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
                        <div className="flex w-full items-center gap-3 sm:w-auto sm:max-w-none sm:justify-end">
                            {screen.workflowDefinition.canCreateInstance && (
                                <Button
                                    intent="secondary"
                                    variant="destructive"
                                    onClick={handleCreate}
                                    isLoading={isCreating}
                                >
                                    {t("create_new")}
                                </Button>
                            )}
                        </div>
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
