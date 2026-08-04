import {type RouteObject} from "react-router";

import Instance from "../pages/Instance";
import InstanceAdmin from "../pages/InstanceAdmin";
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
    {
        path: "/instance/:id/admin",
        element: <InstanceAdmin />,
    },
];

export default instanceRoutes;
