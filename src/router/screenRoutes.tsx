import type {RouteObject} from "react-router";

import {ProjectScreenOverview} from "~/pages/ScreenPage";
import {ScreenView} from "~/pages/ScreenView";

export const screenRoutes: RouteObject[] = [
    {
        path: "/screens/project-overview",
        element: <ProjectScreenOverview />,
    },
    {
        path: "/screens/:workflowDefinition/:screenName",
        element: <ScreenView />,
    },
];

export default screenRoutes;
