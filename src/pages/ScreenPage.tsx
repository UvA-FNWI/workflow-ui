import {useState} from "react";

import {Card, Heading, Input, Tab, Tabs} from "@datanose/ui";

import {ScreenTable} from "~/components/ScreenTable";
import {useTranslate} from "~/hooks/useTranslate";
import {type OverviewScreenKeys, screensEndpoints} from "~/store/api/screensApi";

export const ProjectScreenOverview = () => {
    const {t} = useTranslate("workflow", {keyPrefix: "screens"});
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
                        Object.keys(screens).map((value) => {
                            const key = value as OverviewScreenKeys;
                            return (
                                <Tab
                                    key={key}
                                    title={t(`dynamic.${key}`)}
                                    count={screens[key].rows.length}
                                >
                                    <ScreenTable
                                        columns={screens[key].columns}
                                        rows={screens[key].rows}
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
