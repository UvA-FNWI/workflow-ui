import {StrictMode} from "react";

import {createRoot} from "react-dom/client";
import {Provider} from "react-redux";
import {RouterProvider} from "react-router";

import {ThemeProvider, ToastProvider} from "@datanose/ui";

import "./i18n";
import "./index.css";
import router from "./router/routes.tsx";
import {store} from "./store/store";

createRoot(document.getElementById("root")!).render(
    <StrictMode>
        <Provider store={store}>
            <ThemeProvider>
                <ToastProvider>
                    <RouterProvider router={router} />
                </ToastProvider>
            </ThemeProvider>
        </Provider>
    </StrictMode>,
);
