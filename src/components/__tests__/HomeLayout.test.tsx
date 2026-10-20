import {createMemoryRouter, RouterProvider, useOutletContext} from "react-router";

import {act, cleanup, fireEvent, render, screen} from "@testing-library/react";
import {afterEach, beforeEach, expect, it, vi} from "vitest";

import {HomeLayout, type HomeLayoutContext} from "../HomeLayout";
import {rememberHomePath} from "~/store/homeNavigationSlice";

// Control query results and saved navigation without making API requests or mounting the app store.
const {getDefinitions, getPersonal, dispatch, homeNavigation} = vi.hoisted(() => ({
    getDefinitions: vi.fn(),
    getPersonal: vi.fn(),
    dispatch: vi.fn(),
    homeNavigation: {homePath: "/", coordinatorPath: "/", userName: "ada"},
}));

vi.mock("~/store/api/workflowDefinitionsApi", () => ({
    useGetAccessibleWorkflowDefinitionsQuery: getDefinitions,
}));

vi.mock("~/store/api/personalApi", () => ({
    useGetPersonalInstancesQuery: getPersonal,
}));

vi.mock("~/store/store", () => ({
    useAppDispatch: () => dispatch,
    useAppSelector: (select: (state: {homeNavigation: typeof homeNavigation}) => unknown) =>
        select({homeNavigation}),
}));

const project = {name: "project", screens: ["overview", "other"]};
const thesis = {name: "thesis", screens: ["overview"]};
const personal = {roles: [{name: "student", title: {en: "Student"}}], instances: []};

// Expose the outlet context as visible content and controls so we can exercise HomeLayout in isolation.
function HomeContent() {
    const {showRoleTabs, activeTab, onTabChange, showBackToChoices} =
        useOutletContext<HomeLayoutContext>();
    return (
        <div>
            <p>Home content</p>
            {showBackToChoices && <p>Back to choices</p>}
            {showRoleTabs && (
                <div>
                    <p>Active tab: {activeTab}</p>
                    <button onClick={() => onTabChange(0)}>Coordinator</button>
                    <button onClick={() => onTabChange(1)}>Personal</button>
                </div>
            )}
        </div>
    );
}

// Use the real router and tab hook to test redirects, version preservation, and localStorage.
function renderHome(path = "/screens/project/overview") {
    const router = createMemoryRouter(
        [
            {
                path: "/",
                element: <HomeLayout />,
                children: [
                    {index: true, element: <HomeContent />},
                    {path: "*", element: <HomeContent />},
                ],
            },
        ],
        {initialEntries: [path]},
    );
    return {router, ...render(<RouterProvider router={router} />)};
}

beforeEach(() => {
    dispatch.mockClear();
    Object.assign(homeNavigation, {homePath: "/", coordinatorPath: "/", userName: "ada"});
    getDefinitions.mockReturnValue({data: [project], isError: false});
    getPersonal.mockReturnValue({data: personal, isLoading: false});
});

afterEach(() => {
    cleanup();
    localStorage.clear();
});

// Either pending request must hide the outlet, preventing role tabs from appearing after the content.
it.each(["definitions", "personal"])("waits for %s before rendering the outlet", (query) => {
    const pendingQuery = query === "definitions" ? getDefinitions : getPersonal;
    pendingQuery.mockReturnValue({isLoading: true, isError: false});
    const {container, unmount} = renderHome();

    expect(container.querySelector('[aria-busy="true"]')).toBeInTheDocument();
    expect(screen.queryByText("Home content")).not.toBeInTheDocument();

    // Mount again with resolved data to check that the content and role tabs are available together.
    pendingQuery.mockReturnValue({
        data: query === "definitions" ? [project] : personal,
        isLoading: false,
        isError: false,
    });
    unmount();
    const loaded = renderHome();

    expect(loaded.container.querySelector('[aria-busy="true"]')).not.toBeInTheDocument();
    expect(screen.getByText("Home content")).toBeInTheDocument();
    expect(screen.getByRole("button", {name: "Personal"})).toBeInTheDocument();
});

// A failed request must release the loading placeholder; missing data cannot enable both role views.
it.each(["definitions", "personal"])("does not stay loading when %s fails", (query) => {
    const failedQuery = query === "definitions" ? getDefinitions : getPersonal;
    failedQuery.mockReturnValue({isLoading: false, isError: true});
    const {container} = renderHome();

    expect(container.querySelector('[aria-busy="true"]')).not.toBeInTheDocument();
    expect(screen.getByText("Home content")).toBeInTheDocument();
    expect(screen.queryByRole("button", {name: "Personal"})).not.toBeInTheDocument();
});

// Cached data still supports the current layout while a refresh is in progress.
it("keeps the outlet visible during background refetches", () => {
    getDefinitions.mockReturnValue({data: [project], isError: false, isFetching: true});
    getPersonal.mockReturnValue({data: personal, isLoading: false, isFetching: true});
    const {container} = renderHome();

    expect(container.querySelector('[aria-busy="true"]')).not.toBeInTheDocument();
    expect(screen.getByRole("button", {name: "Personal"})).toBeInTheDocument();
});

// No coordinator screens leads to personal; one workflow opens its first screen; several keep choices.
it.each([
    {definitions: [], target: "/personal"},
    {definitions: [{name: "project", screens: []}], target: "/personal"},
    {definitions: [project], target: "/screens/project/overview"},
    {definitions: [project, thesis], target: "/"},
])("routes home to $target for the available workflows", async ({definitions, target}) => {
    // Start elsewhere so every case also checks that the final destination is remembered.
    homeNavigation.homePath = "/previous";
    getDefinitions.mockReturnValue({data: definitions, isError: false});
    const {router} = renderHome("/?version=2026");

    expect(await screen.findByText("Home content")).toBeInTheDocument();
    expect(router.state.location.pathname).toBe(target);
    expect(router.state.location.search).toBe("?version=2026");
    expect(dispatch).toHaveBeenLastCalledWith(rememberHomePath(target));
});

// Switching roles only makes sense when the user has both coordinator screens and personal roles.
it.each([
    {screens: ["overview"], roles: personal.roles, visible: true},
    {screens: [], roles: personal.roles, visible: false},
    {screens: ["overview"], roles: [], visible: false},
])("shows role tabs only when both views are available ($visible)", ({screens, roles, visible}) => {
    getDefinitions.mockReturnValue({data: [{...project, screens}], isError: false});
    getPersonal.mockReturnValue({data: {...personal, roles}, isLoading: false});
    renderHome();

    expect(screen.queryByRole("button", {name: "Personal"}) !== null).toBe(visible);
});

// A coordinator screen needs a way back to workflow choices only when several workflows exist.
it.each([
    {path: "/", definitions: [project, thesis], visible: false},
    {path: "/personal", definitions: [project, thesis], visible: false},
    {path: "/screens/project/overview", definitions: [project, thesis], visible: true},
    {path: "/screens/project/overview", definitions: [project], visible: false},
])("offers workflow choices on $path ($visible)", ({path, definitions, visible}) => {
    getDefinitions.mockReturnValue({data: definitions, isError: false});
    renderHome(path);

    expect(screen.queryByText("Back to choices") !== null).toBe(visible);
});

// Restore a saved coordinator screen if it still exists; otherwise use the appropriate home page.
it.each([
    {savedPath: "/screens/project/other", definitions: [project], target: "/screens/project/other"},
    {
        savedPath: "/screens/removed/overview",
        definitions: [project],
        target: "/screens/project/overview",
    },
    {savedPath: "/screens/removed/overview", definitions: [project, thesis], target: "/"},
])("returns from personal to $target", async ({savedPath, definitions, target}) => {
    homeNavigation.coordinatorPath = savedPath;
    getDefinitions.mockReturnValue({data: definitions, isError: false});
    const {router} = renderHome("/personal?version=2026");

    expect(screen.getByText("Active tab: 1")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", {name: "Coordinator"}));

    expect(await screen.findByText("Active tab: 0")).toBeInTheDocument();
    expect(router.state.location.pathname).toBe(target);
    expect(router.state.location.search).toBe("?version=2026");
});

// Selecting a role tab stays on the current screen and persists independently for each screen.
it("remembers tab selections separately for each screen", async () => {
    const {router, unmount} = renderHome();
    fireEvent.click(screen.getByRole("button", {name: "Personal"}));
    expect(screen.getByText("Active tab: 1")).toBeInTheDocument();
    expect(router.state.location.pathname).toBe("/screens/project/overview");

    await act(() => router.navigate("/screens/project/other"));
    expect(screen.getByText("Active tab: 0")).toBeInTheDocument();
    await act(() => router.navigate("/screens/project/overview"));
    expect(screen.getByText("Active tab: 1")).toBeInTheDocument();

    // Remounting simulates returning to the app with the selection retained in localStorage.
    unmount();
    renderHome();
    expect(screen.getByText("Active tab: 1")).toBeInTheDocument();
});
