import {type RouteObject} from "react-router";

import WorkflowDetail from "../pages/WorkflowDetail";
import WorkflowList from "../pages/WorkflowList";

export const workflowRoutes: RouteObject[] = [
    {
        path: "/workflows",
        element: <WorkflowList />,
    },
    {
        path: "/workflows/:id",
        element: <WorkflowDetail />,
    },
];

export default workflowRoutes;
