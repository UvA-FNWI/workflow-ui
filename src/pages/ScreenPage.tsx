import {useState} from "react";

import {Card, Heading, Input, Tab, TabList, TabPanel, TabPanels, Tabs} from "@datanose/ui";

import {ScreenTable} from "~/components/ScreenTable";
import {useTranslate} from "~/hooks/useTranslate";
import {screensEndpoints} from "~/store/api/screensApi";

export const ProjectScreenOverview = () => {
    const {t, l} = useTranslate("workflow", {keyPrefix: "screens"});
    const {data: screens} = screensEndpoints.getProjectsOverviewScreens.useQuery();
    const [search, setSearch] = useState("");

    if (!screens) {
        return null;
    }

    return (
        <div>
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
                <Tabs>
                    <TabList>
                        {screens.groups.map((group) => (
                            <Tab key={group.name}>
                                {l(group.title)} ({group.rows.length})
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
        </div>
    );
};
