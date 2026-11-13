import {I18nextProvider} from "react-i18next";
import {Provider} from "react-redux";
import {createMemoryRouter, RouterProvider} from "react-router";

import {cleanup, fireEvent, render, screen, waitFor} from "@testing-library/react";
import {createInstance} from "i18next";
import {afterEach, expect, it, vi} from "vitest";

import screens from "../../../public/locales/en/screens.json";
import workflow from "../../../public/locales/en/workflow.json";
import {HomeLayout} from "../HomeLayout";
import {HomePage} from "../HomePage";
import Overview from "~/pages/Overview";
import Personal from "~/pages/Personal";
import {baseApi} from "~/store/api/baseApi";
import {workflowDefinitionsApi} from "~/store/api/workflowDefinitionsApi";
import {clearCurrentUser, setAccessToken} from "~/store/authSlice";
import {store} from "~/store/store";

vi.mock("~/helpers/Environment", () => ({VITE_WEBAPI_URL: "http://api.test"}));

afterEach(() => {
    cleanup();
    store.dispatch(setAccessToken(null));
    store.dispatch(clearCurrentUser());
    store.dispatch(baseApi.util.resetApiState());
    vi.unstubAllGlobals();
});

it.each([0, 1])("keeps people search on home with %i accessible workflows", async (count) => {
    const access = Promise.withResolvers<Response>();
    const project = {
        name: "project",
        title: {en: "Project"},
        titlePlural: {en: "Projects"},
        screens: ["overview"],
    };
    const person = {id: "person-1", displayName: "Ada Example"};
    const fetch = vi.fn(async (request: Request) => {
        switch (new URL(request.url).pathname) {
            case "/Users/Me":
                return access.promise;
            case "/WorkflowDefinitions/Accessible":
                return Response.json(count ? [project] : []);
            case "/Personal/Instances":
                return Response.json({roles: [], instances: []});
            case "/Users/Search":
                return Response.json({people: [person], hasMore: false});
            default:
                throw new Error(`Unexpected request to ${request.url}`);
        }
    });
    vi.stubGlobal("fetch", fetch);
    const i18n = createInstance();
    await i18n.init({lng: "en", resources: {en: {screens, workflow}}});
    const router = createMemoryRouter(
        [
            {
                path: "/",
                element: <HomeLayout />,
                children: [
                    {index: true, element: <Overview />},
                    {path: "/personal", element: <Personal />},
                    {
                        path: "/screens/project/overview",
                        element: <HomePage title="Project screen">Screen content</HomePage>,
                    },
                ],
            },
        ],
        {initialEntries: ["/?search=ada&version=2026"]},
    );

    store.dispatch(setAccessToken("test-token"));
    render(
        <Provider store={store}>
            <I18nextProvider i18n={i18n}>
                <RouterProvider router={router} />
            </I18nextProvider>
        </Provider>,
    );

    await waitFor(() =>
        expect(
            workflowDefinitionsApi.endpoints.getAccessibleWorkflowDefinitions.select()(
                store.getState(),
            ).isSuccess,
        ).toBe(true),
    );
    expect(router.state.location.pathname).toBe("/");

    access.resolve(Response.json({userName: "admin", canSearchPeople: true}));
    expect(await screen.findByRole("link", {name: person.displayName})).toBeVisible();
    expect(router.state.location.search).toBe("?search=ada&version=2026");

    fireEvent.change(screen.getByRole("textbox", {name: workflow.home_search.label}), {
        target: {value: ""},
    });
    if (count === 0) {
        expect(screen.getByText(screens.empty_title)).toBeVisible();
    } else {
        fireEvent.click(screen.getByRole("link", {name: /^Project/}));
        const homeLink = await screen.findByRole("link", {name: workflow.home});
        expect(homeLink).toHaveAttribute("href", "/?version=2026");
    }
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
