import {I18nextProvider} from "react-i18next";
import {createMemoryRouter, RouterProvider} from "react-router";

import {skipToken} from "@reduxjs/toolkit/query";
import {act, cleanup, fireEvent, render, screen, within} from "@testing-library/react";
import {createInstance} from "i18next";
import {afterEach, expect, it, vi} from "vitest";

import screens from "../../../public/locales/en/screens.json";
import workflow from "../../../public/locales/en/workflow.json";
import {HomePage} from "../HomePage";
import PersonOverview from "~/pages/PersonOverview";

const {search, getPerson, getCurrentUser} = vi.hoisted(() => ({
    search: vi.fn(),
    getPerson: vi.fn(),
    getCurrentUser: vi.fn(),
}));

vi.mock("~/store/api/usersApi", () => ({useSearchPeopleQuery: search}));
vi.mock("~/store/api/personalApi", () => ({useGetPersonInstancesQuery: getPerson}));
vi.mock("~/store/store", () => ({useAppSelector: getCurrentUser}));

const person = {
    id: "person-1",
    displayName: "Ada Example",
    email: "ada@example.com",
    userName: "ada",
};

const workflowScreens = [
    {
        name: "project",
        title: {en: "Ada Research Project", nl: "Onderzoeksproject"},
        titlePlural: {en: "Research projects", nl: "Onderzoeksprojecten"},
        screens: ["overview", "archive"],
    },
    {
        name: "thesis",
        title: {en: "Bachelor Thesis", nl: "Bachelorscriptie"},
        titlePlural: {en: "Bachelor theses", nl: "Bachelorscripties"},
        screens: ["overview"],
    },
].flatMap((definition) => definition.screens.map((name) => ({definition, name})));

async function renderHome(path: string, canSearchPeople = true) {
    getCurrentUser.mockReturnValue({canSearchPeople});
    search.mockImplementation((query) =>
        query === skipToken
            ? {}
            : {
                  currentData: {
                      people: query === "ada" || query === person.email ? [person] : [],
                      hasMore: false,
                  },
              },
    );
    getPerson.mockReturnValue({
        currentData: {
            person,
            roles: [{name: "student", title: {en: "Student"}}],
            instances: [
                {
                    id: "project-1",
                    workflowDefinition: "project",
                    workflowDefinitionTitle: {en: "Project"},
                    title: "Ada's project",
                    currentStep: "Start",
                    progress: {text: {en: "In progress"}, color: "green"},
                    createdOn: "2026-11-12T09:00:00Z",
                    roles: ["student"],
                    student: person.displayName,
                    course: null,
                    employees: [],
                },
            ],
        },
    });

    const i18n = createInstance();
    await i18n.init({lng: "en", resources: {en: {screens, workflow}}});
    const router = createMemoryRouter(
        [
            {
                path: "/",
                element: (
                    <HomePage title="Choose your course" searchScreens={workflowScreens}>
                        <p>Workflow choices</p>
                    </HomePage>
                ),
            },
            {
                path: "/screens/:definition/:screen",
                element: <HomePage title="Project screen">Screen content</HomePage>,
            },
            {
                path: "/personal",
                element: <HomePage title="My overview">Personal content</HomePage>,
            },
            {path: "/personal/:personId", element: <PersonOverview />},
        ],
        {initialEntries: [path]},
    );
    render(
        <I18nextProvider i18n={i18n}>
            <RouterProvider router={router} />
        </I18nextProvider>,
    );
    return router;
}

afterEach(() => {
    cleanup();
    vi.useRealTimers();
    vi.clearAllMocks();
});

it("waits until typing pauses before searching or warning about query length", async () => {
    vi.useFakeTimers();
    await renderHome("/");
    const input = screen.getByRole("textbox", {name: workflow.home_search.label});

    fireEvent.change(input, {target: {value: "a"}});
    act(() => vi.advanceTimersByTime(499));
    expect(screen.queryByText(workflow.home_search.query_length)).not.toBeInTheDocument();
    expect(screen.getByText("Workflow choices")).toBeVisible();
    expect(screen.getByRole("heading", {level: 1, name: "Choose your course"})).toBeVisible();
    act(() => vi.advanceTimersByTime(1));
    expect(screen.getByText(workflow.home_search.query_length)).toBeVisible();
    expect(screen.getByText("Workflow choices")).not.toBeVisible();
    expect(screen.getByRole("heading", {level: 1, name: workflow.home_search.title})).toBeVisible();

    fireEvent.change(input, {target: {value: "ad"}});
    act(() => vi.advanceTimersByTime(400));
    fireEvent.change(input, {target: {value: "ada"}});
    act(() => vi.advanceTimersByTime(499));

    expect(search.mock.calls.every(([query]) => query === skipToken)).toBe(true);
    expect(screen.queryByText("Searching…")).not.toBeInTheDocument();
    expect(screen.getByText(workflow.home_search.query_length)).toBeVisible();

    act(() => vi.advanceTimersByTime(1));

    expect(search).toHaveBeenLastCalledWith("ada");
    expect(screen.queryByText(workflow.home_search.query_length)).not.toBeInTheDocument();
    expect(screen.getByText("Workflow choices")).not.toBeVisible();

    fireEvent.change(input, {target: {value: "ada@example.com"}});
    expect(screen.getByRole("heading", {name: "3 results for “ada”"})).toBeVisible();

    fireEvent.change(input, {target: {value: ""}});
    expect(screen.getByText("Workflow choices")).toBeVisible();
    expect(screen.getByRole("heading", {level: 1, name: "Choose your course"})).toBeVisible();
});

it("searches from home and restores the query after opening a person", async () => {
    const router = await renderHome("/?version=pilot");
    const input = screen.getByRole("textbox", {name: workflow.home_search.label});
    fireEvent.change(input, {target: {value: "ada@example.com"}});

    const result = await screen.findByRole("link", {name: /Ada Example/});
    expect(search).toHaveBeenLastCalledWith("ada@example.com");
    expect(screen.getByRole("heading", {name: "1 result for “ada@example.com”"})).toBeVisible();
    expect(screen.getByText("Workflow choices")).not.toBeVisible();
    fireEvent.click(result);

    expect(await screen.findByRole("heading", {name: "Ada Example"})).toBeVisible();
    expect(getPerson).toHaveBeenLastCalledWith(person.id);
    expect(router.state.location.search).toBe("?version=pilot");
    expect(screen.getByRole("link", {name: person.displayName})).toHaveAttribute(
        "href",
        "/instance/project-1?version=pilot",
    );
    fireEvent.click(screen.getByRole("link", {name: "Back to search results"}));

    const restoredInput = await screen.findByRole("textbox", {name: workflow.home_search.label});
    expect(restoredInput).toHaveValue("ada@example.com");
    expect(router.state.location.search).toBe("?version=pilot&search=ada%40example.com");
    expect(screen.getByRole("link", {name: /Ada Example/})).toBeVisible();
    fireEvent.change(restoredInput, {target: {value: ""}});
    expect(await screen.findByText("Workflow choices")).toBeVisible();
    expect(router.state.location.search).toBe("?version=pilot");
});

it.each([
    {
        query: "ada",
        count: 3,
        path: "/screens/project/overview",
        name: /Ada Research Project\s*overview/,
    },
    {
        query: "ARCHIVE",
        count: 1,
        path: "/screens/project/archive",
        name: /Ada Research Project\s*archive/,
    },
    {
        query: "Bachelorscriptie",
        count: 1,
        path: "/screens/thesis/overview",
        name: /^Bachelor Thesis/,
    },
])(
    "opens a matching workflow screen for $query and preserves its version",
    async ({query, count, path, name}) => {
        const router = await renderHome(`/?search=${query}&version=pilot`);

        const lists = screen.getAllByRole("list");
        expect(lists).toHaveLength(query === "ada" ? 2 : 1);
        if (query === "ada") {
            expect(within(lists[1]).getByRole("link", {name: /^Ada Example/})).toBeVisible();
        }
        expect(screen.getAllByRole("listitem")).toHaveLength(count);
        const result = within(lists[0]).getByRole("link", {name});
        expect(result).toHaveAttribute("href", `${path}?version=pilot`);
        fireEvent.click(result);

        expect(await screen.findByRole("heading", {name: "Project screen"})).toBeVisible();
        expect(router.state.location.pathname).toBe(path);
        expect(router.state.location.search).toBe("?version=pilot");
    },
);

it("does not run a search from the URL without search permission", async () => {
    await renderHome("/?search=ada", false);

    expect(screen.getByText("Workflow choices")).toBeVisible();
    expect(
        screen.queryByRole("textbox", {name: workflow.home_search.label}),
    ).not.toBeInTheDocument();
    expect(search.mock.calls).toEqual([[skipToken]]);
});

it.each([
    ["/screens/project/overview", "Screen content"],
    ["/personal", "Personal content"],
])("keeps search off %s", async (path, content) => {
    await renderHome(`${path}?search=ada`);

    expect(screen.getByText(content)).toBeVisible();
    expect(
        screen.queryByRole("textbox", {name: workflow.home_search.label}),
    ).not.toBeInTheDocument();
    expect(search).not.toHaveBeenCalled();
});
