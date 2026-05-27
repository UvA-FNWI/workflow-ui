import {type RouteObject} from "react-router";

import Instance from "../pages/Instance";
import InstanceJobs from "../pages/InstanceJobs";

export const instanceRoutes: RouteObject[] = [
    {
        path: "/instance/:id",
        element: <Instance />,
    },
    {
        path: "/instance/:id/jobs",
        element: <InstanceJobs />,
    },
];

export default instanceRoutes;
