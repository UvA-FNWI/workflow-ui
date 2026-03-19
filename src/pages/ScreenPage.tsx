import {useState} from "react";

import {
    Card,
    Container,
    Heading,
    Input,
    Pill,
    Tab,
    TabList,
    TabPanel,
    TabPanels,
    Tabs,
} from "@datanose/ui";

import {ScreenTable} from "~/components/ScreenTable";
import {useTranslate} from "~/hooks/useTranslate";
import {screensEndpoints} from "~/store/api/screensApi";

export const ProjectScreenOverview = () => {
    const {t, l} = useTranslate("workflow", {keyPrefix: "screens"});
    const {data: screens} = screensEndpoints.getProjectsOverviewScreens.useQuery();
    const [search, setSearch] = useState("");
    const [activeTab, setActiveTab] = useState(0);

    if (!screens) {
        return null;
    }

    return (
        <Container>
            <Card>
                <div className="mb-4">
                    <div className="flex w-full justify-between">
                        <Heading as="h1">{t("students")}</Heading>
                        <Input
                            value={search}
                            onChange={setSearch}
                            placeholder="Search..."
                            className="w-fit max-w-sm"
                        />
                    </div>
                </div>
                <Tabs activeIndex={activeTab} onTabChange={setActiveTab}>
                    <TabList>
                        {screens.groups.map((group, index) => (
                            <Tab key={group.name}>
                                <div className="flex w-full justify-between gap-2">
                                    <span>{l(group.title)}</span>
                                    <Pill variant={activeTab === index ? "red" : "grey"}>
                                        {group.rows.length}
                                    </Pill>
                                </div>
                            </Tab>
                        ))}
                    </TabList>
                    <TabPanels>
                        {screens.groups.map((group) => (
                            <TabPanel key={group.name}>
                                <ScreenTable
                                    columns={screens.columns}
                                    rows={group.rows}
                                    globalFilter={search}
                                />
                            </TabPanel>
                        ))}
                    </TabPanels>
                </Tabs>
            </Card>
        </Container>
    );
};
