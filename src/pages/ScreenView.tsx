import {useState} from "react";

import {useParams} from "react-router";

import {
    Card,
    Container,
    Heading,
    Pill,
    SearchInput,
    Tab,
    TabList,
    TabPanel,
    TabPanels,
    Tabs,
} from "@uva-fnwi/datanose-ui";

import {ScreenTable} from "~/components/ScreenTable";
import {useTranslate} from "~/hooks/useTranslate";
import {useGetScreenQuery} from "~/store/api/screensApi";

export const ScreenView = () => {
    const {t, l} = useTranslate("common");
    const {workflowDefinition, screenName} = useParams();
    const {data: screen} = useGetScreenQuery(
        {workflowDefinition: workflowDefinition ?? "", screenName: screenName ?? ""},
        {skip: !workflowDefinition || !screenName},
    );
    const [search, setSearch] = useState("");
    const [activeTab, setActiveTab] = useState(0);

    if (!screen) {
        return null;
    }

    return (
        <Container maxWidth={1280}>
            <Card>
                <div className="mb-4">
                    <div className="flex w-full justify-between">
                        <Heading as="h1">{screen.workflowDefinition}</Heading>
                        <SearchInput
                            value={search}
                            onChange={setSearch}
                            placeholder={t("search_placeholder")}
                            className="w-fit max-w-sm"
                        />
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
                        <TabPanels>
                            {screen.groups.map((group) => (
                                <TabPanel key={group.name}>
                                    <div className="mt-8">
                                        <ScreenTable
                                            columns={screen.columns}
                                            rows={group.rows}
                                            globalFilter={search}
                                        />
                                    </div>
                                </TabPanel>
                            ))}
                        </TabPanels>
                    </Tabs>
                ) : (
                    <ScreenTable
                        columns={screen.columns}
                        rows={screen.rows}
                        globalFilter={search}
                    />
                )}
            </Card>
        </Container>
    );
};
