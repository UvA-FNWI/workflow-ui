import {type RouteObject} from "react-router";

import Instance from "../pages/Instance";

export const instanceRoutes: RouteObject[] = [
    {
        path: "/instance/:id",
        element: <Instance />,
    },
];

export default instanceRoutes;
