import {createBrowserRouter, type RouteObject} from "react-router";

import App from "../App";
import Overview from "../pages/Overview";
import {instanceRoutes} from "./instanceRoutes";
import {workflowRoutes} from "./workflowRoutes";

const routes: RouteObject[] = [
    {
        path: "/",
        element: <App />,
        children: [
            {
                index: true,
                element: <Overview />,
            },
            ...instanceRoutes,
            ...workflowRoutes,
        ],
    },
];

export const router = createBrowserRouter(routes);

export default router;
