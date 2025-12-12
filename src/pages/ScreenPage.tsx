import {useState} from "react";

import {Card, Heading, Input, Tab, Tabs} from "@datanose/ui";

import {ScreenTable} from "~/components/ScreenTable";
import {useTranslate} from "~/hooks/useTranslate";
import {screensEndpoints} from "~/store/api/screensApi";

export const ProjectScreenOverview = () => {
    const {t, l} = useTranslate("workflow", {keyPrefix: "screens"});
    const {data: screens} = screensEndpoints.getProjectsOverviewScreens.useQuery();
    const [search, setSearch] = useState("");

    return (
        <div>
            <Card>
                <div className="mb-4">
                    <div className="flex w-full justify-between">
                        <Heading>{t("students")}</Heading>
                        <Input
                            value={search}
                            onChange={setSearch}
                            placeholder="Search..."
                            className="w-fit max-w-sm"
                        />
                    </div>
                </div>
                <Tabs>
                    {screens &&
                        screens.groups.map((group) => {
                            return (
                                <Tab
                                    key={group.name}
                                    title={l(group.title)}
                                    count={group.rows.length}
                                >
                                    <ScreenTable
                                        columns={screens.columns}
                                        rows={group.rows}
                                        globalFilter={search}
                                    />
                                </Tab>
                            );
                        })}
                </Tabs>
            </Card>
        </div>
    );
};
