import {I18nextProvider} from "react-i18next";
import {createMemoryRouter, Outlet, RouterProvider} from "react-router";

import {act, cleanup, fireEvent, render, screen, within} from "@testing-library/react";
import {createInstance} from "i18next";
import {afterEach, expect, it, vi} from "vitest";

import screens from "../../../public/locales/en/screens.json";
import workflow from "../../../public/locales/en/workflow.json";
import type {HomeLayoutContext} from "../HomeLayout";
import {HomePage} from "../HomePage";
import Overview from "~/pages/Overview";
import Personal from "~/pages/Personal";
import PersonOverview from "~/pages/PersonOverview";
import type {UserDto} from "~/store/api/types/users";

const {search, getPerson, getAccessibleDefinitions} = vi.hoisted(() => ({
    search: vi.fn(),
    getPerson: vi.fn(),
    getAccessibleDefinitions: vi.fn(),
}));

vi.mock("~/store/api/workflowDefinitionsApi", () => ({
    useGetAccessibleWorkflowDefinitionsQuery: () => getAccessibleDefinitions(),
}));

vi.mock("~/store/api/personalApi", () => ({
    useGetPersonInstancesQuery: getPerson,
    useGetPersonalInstancesQuery: () => ({}),
    useSearchUsersQuery: search,
}));

vi.mock("~/store/api/settingsApi", () => ({
    useGetSettingsQuery: () => ({data: undefined, isLoading: false, isError: false}),
}));

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

const availableDefinitions = [
    {
        name: "project",
        title: {en: "Ada Research Project", nl: "Onderzoeksproject"},
        titlePlural: {en: "Research projects", nl: "Onderzoeksprojecten"},
        screens: [
            {name: "overview", title: null, description: null, index: 0},
            {name: "archive", title: null, description: null, index: 1},
        ],
    },
    {
        name: "thesis",
        title: {en: "Bachelor Thesis", nl: "Bachelorscriptie"},
        titlePlural: {en: "Bachelor theses", nl: "Bachelorscripties"},
        screens: [{name: "overview", title: null, description: null, index: 0}],
    },
].map((definition) => ({
    ...definition,
    description: null,
    index: null,
    icon: null,
    isAlwaysVisible: false,
    inheritsFrom: null,
    isEmbedded: false,
    canCreateInstance: false,
    isPropertyOnly: false,
    properties: [],
}));

async function renderHome(
    path: string,
    {definitions = availableDefinitions, people = [person], showRoleTabs = false} = {},
) {
    search.mockImplementation((query) => ({
        currentData: {
            people: query === "ada" || query === person.email ? people : [],
            hasMore: false,
        },
    }));
    getAccessibleDefinitions.mockReturnValue({
        data: definitions,
        isLoading: false,
        isError: false,
    });
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
                    staff: [],
                },
            ],
        },
    });

    const i18n = createInstance();
    await i18n.init({lng: "en", resources: {en: {screens, workflow}}});
    const navigation: HomeLayoutContext = {
        definitions,
        showRoleTabs,
        activeTab: 0,
        onTabChange: () => {},
        showBackToChoices: false,
    };
    const router = createMemoryRouter(
        [
            {
                path: "/",
                element: <Outlet context={navigation} />,
                children: [{index: true, element: <Overview />}],
            },
            {
                path: "/screens/:definition/:screen",
                element: <HomePage title="Project screen">Screen content</HomePage>,
            },
            {
                path: "/personal",
                element: <Personal />,
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

it("shows a profile picture when available and initials otherwise", async () => {
    const picture = "/avatar.png";
    await renderHome("/?search=ada", {
        people: [person, {...person, id: "person-2", displayName: "Alma Example", picture}],
    });

    const withoutPicture = within(screen.getByRole("link", {name: /^Ada Example/}));
    expect(withoutPicture.getByText("A. E.")).toBeVisible();
    expect(withoutPicture.queryByAltText("Ada Example")).not.toBeInTheDocument();

    const withPicture = within(screen.getByRole("link", {name: /^Alma Example/}));
    const image = withPicture.getByAltText("Alma Example");
    expect(image).toHaveAttribute("src", picture);
    fireEvent.load(image);
    expect(image).toBeVisible();
    expect(withPicture.queryByText("A. E.")).not.toBeInTheDocument();
});

it("shows the organization when available, followed by the username and email", async () => {
    await renderHome("/?search=ada", {
        people: [
            {...person, userName: "1234567", organization: {id: "fnwi", name: "FNWI"}},
            {
                ...person,
                id: "person-2",
                displayName: "Alma Example",
                userName: "alma1234",
                email: "alma@example.com",
            },
        ],
    });

    const student = within(screen.getByRole("link", {name: /^Ada Example/}));
    const employee = within(screen.getByRole("link", {name: /^Alma Example/}));
    expect(student.getByText("FNWI - 1234567 - ada@example.com")).toBeVisible();
    expect(employee.getByText("alma1234 - alma@example.com")).toBeVisible();
});

it("keeps the committed search view until typing pauses", async () => {
    vi.useFakeTimers();
    const router = await renderHome("/?version=pilot", {showRoleTabs: true});
    const input = screen.getByRole("textbox", {name: workflow.home_search.label});
    const coordinatorTabName = workflow.overview.coordinator_view;
    expect(screen.getByRole("tab", {name: coordinatorTabName})).toBeVisible();

    fireEvent.change(input, {target: {value: "a"}});
    expect(input).toHaveValue("a");
    expect(screen.queryByText(workflow.home_search.loading)).not.toBeInTheDocument();
    expect(screen.queryByText(workflow.home_search.query_length)).not.toBeInTheDocument();
    expect(screen.getByRole("tab", {name: coordinatorTabName})).toBeVisible();
    expect(
        screen.getByRole("heading", {level: 1, name: workflow.overview.choose_course_title}),
    ).toBeVisible();
    act(() => vi.advanceTimersByTime(499));
    expect(router.state.location.search).toBe("?version=pilot");
    expect(screen.queryByText(workflow.home_search.query_length)).not.toBeInTheDocument();
    await act(async () => {
        vi.advanceTimersByTime(1);
    });
    expect(screen.getByText(workflow.home_search.query_length)).toBeVisible();
    expect(screen.queryByRole("tab", {name: coordinatorTabName})).not.toBeInTheDocument();
    expect(screen.getByRole("heading", {level: 1, name: workflow.home_search.title})).toBeVisible();
    expect(search).not.toHaveBeenCalled();
    expect(router.state.location.search).toBe("?version=pilot&search=a");

    fireEvent.change(input, {target: {value: "ad"}});
    act(() => vi.advanceTimersByTime(400));
    fireEvent.change(input, {target: {value: "ada"}});
    expect(input).toHaveValue("ada");
    expect(screen.getByText(workflow.home_search.query_length)).toBeVisible();
    expect(screen.queryByText(workflow.home_search.loading)).not.toBeInTheDocument();
    act(() => vi.advanceTimersByTime(499));
    expect(router.state.location.search).toBe("?version=pilot&search=a");
    expect(
        screen.queryByRole("list", {name: workflow.home_search.workflows}),
    ).not.toBeInTheDocument();
    expect(search).not.toHaveBeenCalled();
    await act(async () => {
        vi.advanceTimersByTime(1);
    });
    expect(router.state.location.search).toBe("?version=pilot&search=ada");
    expect(router.state.historyAction).toBe("REPLACE");
    expect(search).toHaveBeenCalledWith("ada");
    expect(screen.queryByText(workflow.home_search.query_length)).not.toBeInTheDocument();
    expect(screen.getByRole("link", {name: /Ada Research Project\s*overview/})).toBeVisible();
    expect(screen.getByRole("link", {name: /^Ada Example/})).toBeVisible();

    search.mockImplementation((query) => ({
        currentData: {people: query === "ada" ? [person] : [], hasMore: false},
        isFetching: query === "archive",
    }));
    fireEvent.change(input, {target: {value: "archive"}});
    expect(screen.queryByText(workflow.home_search.loading)).not.toBeInTheDocument();
    expect(screen.getByRole("link", {name: /Ada Research Project\s*overview/})).toBeVisible();
    expect(screen.getByRole("link", {name: /^Ada Example/})).toBeVisible();
    expect(router.state.location.search).toBe("?version=pilot&search=ada");
    expect(search).not.toHaveBeenCalledWith("archive");
    await act(async () => {
        vi.advanceTimersByTime(500);
    });
    expect(router.state.location.search).toBe("?version=pilot&search=archive");
    expect(search).toHaveBeenCalledWith("archive");
    expect(screen.getByText(workflow.home_search.loading)).toBeVisible();
    expect(screen.getByRole("link", {name: /Ada Research Project\s*archive/})).toBeVisible();
    expect(screen.queryByRole("link", {name: /^Ada Example/})).not.toBeInTheDocument();

    fireEvent.change(input, {target: {value: ""}});
    expect(input).toHaveValue("");
    expect(screen.getByText(workflow.home_search.loading)).toBeVisible();
    expect(screen.getByRole("link", {name: /Ada Research Project\s*archive/})).toBeVisible();
    expect(screen.queryByRole("tab", {name: coordinatorTabName})).not.toBeInTheDocument();
    await act(async () => {
        vi.advanceTimersByTime(500);
    });
    expect(router.state.location.search).toBe("?version=pilot");
    expect(screen.getByRole("tab", {name: coordinatorTabName})).toBeVisible();
    expect(
        screen.getByRole("heading", {level: 1, name: workflow.overview.choose_course_title}),
    ).toBeVisible();
    expect(screen.queryByText(workflow.home_search.loading)).not.toBeInTheDocument();
});

it("searches from home and restores the query after opening a person", async () => {
    const router = await renderHome("/?version=pilot");
    const input = screen.getByRole("textbox", {name: workflow.home_search.label});
    fireEvent.change(input, {target: {value: "ada@example.com"}});

    const result = await screen.findByRole("link", {name: /Ada Example/});
    expect(search).toHaveBeenLastCalledWith("ada@example.com");
    expect(screen.getByRole("heading", {name: "1 result for “ada@example.com”"})).toBeVisible();
    expect(screen.getByText("Bachelor Thesis")).not.toBeVisible();
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
    expect(await screen.findByRole("link", {name: /Bachelor theses/i})).toBeVisible();
    expect(router.state.location.search).toBe("?version=pilot");
});

it("restores the previous search when going back with an uncommitted edit", async () => {
    vi.useFakeTimers();
    const router = await renderHome("/?search=ada&version=pilot");
    await act(() => router.navigate("/?search=archive&version=pilot"));

    const input = screen.getByRole("textbox", {name: workflow.home_search.label});
    expect(input).toHaveValue("archive");
    search.mockClear();
    fireEvent.change(input, {target: {value: "bachelor"}});
    expect(input).toHaveValue("bachelor");
    expect(router.state.location.search).toBe("?search=archive&version=pilot");
    expect(screen.getByRole("link", {name: /Ada Research Project\s*archive/})).toBeVisible();
    expect(screen.queryByRole("link", {name: /^Bachelor Thesis/})).not.toBeInTheDocument();
    expect(search).not.toHaveBeenCalledWith("bachelor");

    await act(() => router.navigate(-1));
    const restoredLocationKey = router.state.location.key;
    expect(screen.getByRole("textbox", {name: workflow.home_search.label})).toHaveValue("ada");
    expect(search).toHaveBeenCalledWith("ada");
    expect(screen.getByRole("link", {name: /^Ada Example/})).toBeVisible();

    await act(async () => {
        vi.advanceTimersByTime(500);
    });
    expect(router.state.location.search).toBe("?search=ada&version=pilot");
    expect(router.state.location.key).toBe(restoredLocationKey);
    expect(router.state.historyAction).toBe("POP");
    expect(search).not.toHaveBeenCalledWith("bachelor");
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

it("does not run a search from the URL without a coordinator screen", async () => {
    await renderHome("/?search=ada", {definitions: []});

    expect(
        screen.queryByRole("textbox", {name: workflow.home_search.label}),
    ).not.toBeInTheDocument();
    expect(search).not.toHaveBeenCalled();
});

it.each([
    ["/screens/project/overview", "Screen content"],
    ["/personal", screens.title],
])("keeps search off %s", async (path, content) => {
    await renderHome(`${path}?search=ada`);

    expect(screen.getByText(content)).toBeVisible();
    expect(
        screen.queryByRole("textbox", {name: workflow.home_search.label}),
    ).not.toBeInTheDocument();
    expect(search).not.toHaveBeenCalled();
});
