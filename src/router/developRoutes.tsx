import {type RouteObject} from "react-router";

import Develop from "../pages/Develop";
import Migrations from "../pages/Migrations";

export const developRoutes: RouteObject[] = [
    {
        path: "/develop",
        element: <Develop />,
    },
    {
        path: "/develop/migrations",
        element: <Migrations />,
    },
];

export default developRoutes;
