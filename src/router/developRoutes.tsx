import {type RouteObject} from "react-router";

import FormEditorPage from "../components/FormEditor/FormEditorPage";
import Develop from "../pages/Develop";

export const developRoutes: RouteObject[] = [
    {
        path: "/develop",
        element: <Develop />,
    },
    {
        path: "/develop/forms/:definition/:form",
        element: <FormEditorPage />,
    },
];

export default developRoutes;
