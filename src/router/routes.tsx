import {createBrowserRouter, type RouteObject} from "react-router";

import App from "../App";
import AuthGuard from "../components/AuthGuard";
import AuthCallback from "../pages/AuthCallback";
import CanvasCallback from "../pages/CanvasCallback";
import Overview from "../pages/Overview";
import {developRoutes} from "./developRoutes";
import {instanceRoutes} from "./instanceRoutes";
import screenRoutes from "./screenRoutes";

const routes: RouteObject[] = [
    {
        path: "/callback",
        element: <AuthCallback />,
    },
    {
        path: "/canvas",
        element: <CanvasCallback />,
    },
    {
        element: <AuthGuard />,
        children: [
            {
                path: "/",
                element: <App />,
                children: [
                    {
                        index: true,
                        element: <Overview />,
                    },
                    ...instanceRoutes,
                    ...screenRoutes,
                    ...developRoutes,
                ],
            },
        ],
    },
];

export const router = createBrowserRouter(routes);

export default router;
