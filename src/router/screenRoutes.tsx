import type {RouteObject} from "react-router";

import {ScreenView} from "~/pages/ScreenView";

export const screenRoutes: RouteObject[] = [
    {
        path: "/screens/:workflowDefinition/:screenName",
        element: <ScreenView />,
    },
];

export default screenRoutes;
