import {I18nextProvider} from "react-i18next";
import {Provider} from "react-redux";
import {createMemoryRouter, RouterProvider} from "react-router";

import {cleanup, render, screen} from "@testing-library/react";
import {createInstance} from "i18next";
import {afterEach, expect, it, vi} from "vitest";

import workflow from "../../../public/locales/en/workflow.json";
import {HomeLayout} from "../HomeLayout";
import Overview from "~/pages/Overview";
import {baseApi} from "~/store/api/baseApi";
import {store} from "~/store/store";

vi.mock("~/helpers/Environment", () => ({VITE_WEBAPI_URL: "http://api.test"}));

afterEach(() => {
    cleanup();
    store.dispatch(baseApi.util.resetApiState());
    vi.unstubAllGlobals();
});

it("shows a home error after one Accessible request when the API is down", async () => {
    const fetch = vi.fn<(request: Request) => Promise<Response>>();
    fetch.mockRejectedValue(new TypeError("Failed to fetch"));
    vi.stubGlobal("fetch", fetch);

    const i18n = createInstance();
    await i18n.init({lng: "en", resources: {en: {workflow}}});
    const router = createMemoryRouter([
        {path: "/", element: <HomeLayout />, children: [{index: true, element: <Overview />}]},
    ]);

    render(
        <Provider store={store}>
            <I18nextProvider i18n={i18n}>
                <RouterProvider router={router} />
            </I18nextProvider>
        </Provider>,
    );

    expect(await screen.findByRole("alert")).toHaveTextContent(workflow.overview.load_error);
    expect(
        fetch.mock.calls.filter(
            ([request]) => new URL(request.url).pathname === "/WorkflowDefinitions/Accessible",
        ),
    ).toHaveLength(1);
});
