import {Card, Tab, Tabs} from "@datanose/ui";

import {screensEndpoints} from "~/store/api/screensApi";

export const ProjectScreenOverview = () => {
    const {data: screens} = screensEndpoints.getProjectsOverviewScreens.useQuery();

    console.log(screens);

    return (
        <div>
            <h1>Project Screen Overview</h1>
            <div>
                <Card>
                    <Tabs>
                        {screens &&
                            Object.keys(screens).map((key) => (
                                <Tab key={key} title={key} count={screens[key].rows.length}>
                                    content
                                </Tab>
                            ))}
                    </Tabs>
                </Card>
            </div>
        </div>
    );
};
