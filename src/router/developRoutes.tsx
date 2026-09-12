import {type RouteObject} from "react-router";

import FormEditorPage from "../components/FormEditor/FormEditorPage";
import Develop from "../pages/Develop";
import Migrations from "../pages/Migrations";

export const developRoutes: RouteObject[] = [
    {
        path: "/develop",
        element: <Develop />,
    },
    {
        path: "/develop/forms/:definition/:form",
        element: <FormEditorPage />,
    },
    {
        path: "/develop/migrations",
        element: <Migrations />,
    },
];

export default developRoutes;
