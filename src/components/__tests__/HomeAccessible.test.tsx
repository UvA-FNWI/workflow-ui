import {I18nextProvider} from "react-i18next";
import {Provider} from "react-redux";
import {createMemoryRouter, RouterProvider} from "react-router";

import {cleanup, fireEvent, render, screen} from "@testing-library/react";
import {createInstance} from "i18next";
import {afterEach, expect, it, vi} from "vitest";

import screens from "../../../public/locales/en/screens.json";
import workflow from "../../../public/locales/en/workflow.json";
import {HomeLayout} from "../HomeLayout";
import {HomePage} from "../HomePage";
import Overview from "~/pages/Overview";
import Personal from "~/pages/Personal";
import PersonOverview from "~/pages/PersonOverview";
import {baseApi} from "~/store/api/baseApi";
import type {UserDto} from "~/store/api/types/users";
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

it.each([0, 1])("routes using the %i accessible workflows", async (count) => {
    const project = {
        name: "project",
        title: {en: "Project"},
        titlePlural: {en: "Projects"},
        screens: ["overview"],
    };
    const person: UserDto = {
        id: "person-1",
        displayName: "Ada Example",
        email: "ada@example.com",
        userName: "ada",
        preferredLanguage: null,
        picture: null,
        organization: null,
        isExternal: false,
        isSuperAdmin: false,
        isEmailEditable: false,
    };
    const currentUser = {
        ...person,
        id: "user-1",
        displayName: "Admin",
        email: "admin@example.com",
        userName: "admin",
    };
    const fetch = vi.fn(async (request: Request) => {
        switch (new URL(request.url).pathname) {
            case "/Users/Me":
                return Response.json(currentUser);
            case "/WorkflowDefinitions/Accessible":
                return Response.json(count ? [project] : []);
            case "/Personal/Me":
                return Response.json({person: currentUser, roles: [], instances: []});
            case "/Personal/person-1":
                return Response.json({person, roles: [], instances: []});
            case "/Personal/Search":
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
            {path: "/personal/:personId", element: <PersonOverview />},
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

    if (count === 0) {
        expect(await screen.findByText(screens.empty_title)).toBeVisible();
        expect(router.state.location.pathname).toBe("/personal");
        expect(screen.queryByRole("search")).not.toBeInTheDocument();
        expect(
            fetch.mock.calls.some(
                ([request]) => new URL(request.url).pathname === "/Personal/Search",
            ),
        ).toBe(false);
        return;
    }

    const personLink = await screen.findByRole("link", {name: /^Ada Example/});
    expect(router.state.location.pathname).toBe("/");
    expect(router.state.location.search).toBe("?search=ada&version=2026");

    fireEvent.click(personLink);
    expect(await screen.findByRole("heading", {name: person.displayName})).toBeVisible();
    fireEvent.click(screen.getByRole("link", {name: screens.person.back_to_search}));

    const searchInput = await screen.findByRole("textbox", {name: workflow.home_search.label});
    expect(searchInput).toHaveValue("ada");
    fireEvent.change(searchInput, {
        target: {value: ""},
    });
    fireEvent.click(screen.getByRole("link", {name: /^Project/}));
    const homeLink = await screen.findByRole("link", {name: workflow.home});
    expect(homeLink).toHaveAttribute("href", "/?version=2026");
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
