import type {RouteObject} from "react-router";

import {ProjectScreenOverview} from "~/pages/ScreenPage";

export const screenRoutes: RouteObject[] = [
    {
        path: "/screens/project-overview",
        element: <ProjectScreenOverview />,
    },
];

export default screenRoutes;
