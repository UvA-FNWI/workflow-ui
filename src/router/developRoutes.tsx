import {type RouteObject} from "react-router";

import Develop from "../pages/Develop";

export const developRoutes: RouteObject[] = [
    {
        path: "/develop",
        element: <Develop />,
    },
];

export default developRoutes;
