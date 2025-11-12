import {StrictMode} from "react";

import {createRoot} from "react-dom/client";
import {RouterProvider} from "react-router";

import {ThemeProvider} from "@datanose/ui";

import "./i18n";
import "./index.css";
import router from "./router/routes.tsx";

createRoot(document.getElementById("root")!).render(
    <StrictMode>
        <ThemeProvider>
            <RouterProvider router={router} />
        </ThemeProvider>
    </StrictMode>,
);
