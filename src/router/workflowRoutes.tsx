import {type RouteObject} from "react-router";
import WorkflowList from "../pages/WorkflowList";
import WorkflowDetail from "../pages/WorkflowDetail";

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
