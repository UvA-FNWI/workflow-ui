import {I18nextProvider} from "react-i18next";
import {Provider} from "react-redux";
import {createMemoryRouter, RouterProvider} from "react-router";

import {configureStore, type Middleware} from "@reduxjs/toolkit";
import {act, cleanup, fireEvent, render, screen, waitFor, within} from "@testing-library/react";
import {createInstance} from "i18next";
import {afterEach, beforeEach, expect, it, vi} from "vitest";

import enScreens from "../../../public/locales/en/screens.json";
import nlScreens from "../../../public/locales/nl/screens.json";
import {ScreenView} from "../ScreenView";
import {baseApi} from "~/store/api/baseApi";
import {personalApi} from "~/store/api/personalApi";
import {screensApi} from "~/store/api/screensApi";
import type {ScreenData} from "~/store/api/types/screens";
import effectsReducer from "~/store/effectsSlice";

const request = vi.hoisted(() => vi.fn());
vi.mock("~/store/api/baseApi", async () => {
    const {createApi} = await import("@reduxjs/toolkit/query/react");
    return {
        baseApi: createApi({
            reducerPath: "api",
            baseQuery: request,
            tagTypes: [
                "Screen",
                "Instance",
                "InstanceActions",
                "Submission",
                "Assessments",
                "Choices",
            ],
            endpoints: () => ({}),
        }),
    };
});
vi.mock("~/components/HomePage", () => ({
    HomePage: ({children}: {children: React.ReactNode}) => children,
}));
vi.mock("~/components/Import/ImportModal.tsx", () => ({ImportModal: () => null}));

let data: ScreenData;
let preview: {rows: {instanceId: string; status: string}[]};
let executeResult: {data?: unknown; error?: unknown};
let pendingExecution: Promise<unknown> | undefined;
const stores: {dispatch: (action: ReturnType<typeof baseApi.util.resetApiState>) => unknown}[] = [];

beforeEach(() => {
    data = {
        name: "Projects",
        workflowDefinition: {
            name: "Project",
            title: {en: "Projects", nl: "Projecten"},
            titlePlural: {en: "Projects", nl: "Projecten"},
            index: null,
            isAlwaysVisible: false,
            inheritsFrom: null,
            isEmbedded: false,
            screens: ["Projects"],
            canCreateInstance: false,
            isPropertyOnly: false,
            properties: [],
        },
        isBulkEditEnabled: false,
        columns: [
            {
                id: 0,
                title: {en: "Name", nl: "Naam"},
                filterType: "None",
                displayType: "Normal",
                link: false,
                isCurrentStep: false,
                dataType: "String",
            },
        ],
        rows: [
            {id: "alice", values: {0: "Alice"}},
            {id: "bob", values: {0: "Bob"}},
        ],
        bulkActions: [
            {
                action: "Approve",
                label: {en: "Approve proposals", nl: "Voorstellen goedkeuren"},
                icon: {type: "checkmark-line"},
            },
        ],
    };
    preview = {
        rows: [
            {instanceId: "alice", status: "Eligible"},
            {instanceId: "bob", status: "Unavailable"},
        ],
    };
    executeResult = {data: {rows: [{instanceId: "alice", status: "Succeeded"}]}};
    pendingExecution = undefined;
    request.mockImplementation((arg: string | {url: string; method?: string}) => {
        const url = typeof arg === "string" ? arg : arg.url;
        if (url.endsWith("/Preview")) return {data: preview};
        if (typeof arg !== "string" && arg.method === "POST")
            return pendingExecution ?? executeResult;
        if (url === "/Screens/Project/Projects") return {data};
        if (url === "/Personal/Instances") return {data: {roles: [], instances: []}};
        throw new Error(`Unexpected request ${url}`);
    });
});

afterEach(() => {
    cleanup();
    stores.forEach((store) => store.dispatch(baseApi.util.resetApiState()));
    stores.length = 0;
    localStorage.clear();
    vi.clearAllMocks();
});

async function openScreen(language = "en") {
    const store = configureStore({
        reducer: {[baseApi.reducerPath]: baseApi.reducer, effects: effectsReducer},
        middleware: (getDefault) => getDefault().concat(baseApi.middleware as Middleware),
    });
    stores.push(store);
    const i18n = createInstance();
    await i18n.init({
        lng: language,
        fallbackLng: "en",
        resources: {
            en: {screens: enScreens},
            nl: {screens: nlScreens},
        },
    });
    const router = createMemoryRouter(
        [{path: "/screens/:workflowDefinition/:screenName", element: <ScreenView />}],
        {initialEntries: ["/screens/Project/Projects"]},
    );
    render(
        <Provider store={store}>
            <I18nextProvider i18n={i18n}>
                <RouterProvider router={router} />
            </I18nextProvider>
        </Provider>,
    );
    await screen.findByText("Alice");
    return {store, router, i18n};
}

function executions() {
    return request.mock.calls.filter(
        ([arg]) =>
            typeof arg === "object" && arg.method === "POST" && !arg.url.endsWith("/Preview"),
    );
}

async function confirmButton() {
    const button = await screen.findByRole("button", {name: "Confirm"});
    await waitFor(() => expect(button).toBeEnabled());
    return button;
}

it("offers only configured buttons and supports mixed select-all state with stable row IDs", async () => {
    await openScreen();
    expect(screen.getByRole("button", {name: "Approve proposals"})).toBeDisabled();
    fireEvent.click(screen.getByRole("checkbox", {name: "Select row 1"}));
    expect(screen.getByRole("checkbox", {name: "Select all rows"})).toBePartiallyChecked();
    fireEvent.click(screen.getByRole("checkbox", {name: "Select all rows"}));
    expect(screen.getAllByRole("checkbox")).toHaveLength(3);
    expect(
        screen.getAllByRole("checkbox").every((input) => (input as HTMLInputElement).checked),
    ).toBe(true);
    fireEvent.click(screen.getByRole("checkbox", {name: "Select all rows"}));
    expect(screen.getByRole("button", {name: "Approve proposals"})).toBeDisabled();
});

it("clears hidden selection when searching and selects only filtered rows", async () => {
    await openScreen();
    fireEvent.click(screen.getByRole("checkbox", {name: "Select all rows"}));
    fireEvent.change(screen.getByRole("textbox", {name: "Type a search query"}), {
        target: {value: "Alice"},
    });
    expect(screen.getByRole("button", {name: "Approve proposals"})).toBeDisabled();
    expect(screen.queryByText("Bob")).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole("checkbox", {name: "Select all rows"}));
    fireEvent.click(screen.getByRole("button", {name: "Approve proposals"}));
    await confirmButton();
    const previewCall = request.mock.calls.find(
        ([arg]) => typeof arg === "object" && arg.url.endsWith("/Preview"),
    );
    expect(previewCall?.[0].body.instanceIds).toEqual(["alice"]);
});

it("clears selection when changing tabs and when returning to the original tab", async () => {
    data.groups = [
        {name: "active", title: {en: "Active", nl: "Actief"}, rows: [data.rows[0]]},
        {name: "completed", title: {en: "Completed", nl: "Afgerond"}, rows: [data.rows[1]]},
    ];
    data.rows = [];
    await openScreen();
    fireEvent.click(screen.getByRole("checkbox", {name: "Select all rows"}));
    fireEvent.click(screen.getByRole("tab", {name: /Completed/}));
    expect(screen.getByRole("button", {name: "Approve proposals"})).toBeDisabled();
    fireEvent.click(screen.getByRole("tab", {name: /Active/}));
    expect(screen.getByRole("button", {name: "Approve proposals"})).toBeDisabled();
});

it("does not offer a bulk action for rows hidden by a live refresh", async () => {
    const {store} = await openScreen();
    fireEvent.change(screen.getByRole("textbox", {name: "Type a search query"}), {
        target: {value: "Alice"},
    });
    fireEvent.click(screen.getByRole("checkbox", {name: "Select all rows"}));
    expect(screen.getByRole("button", {name: "Approve proposals"})).toBeEnabled();
    data = {...data, rows: [{id: "alice", values: {0: "Carol"}}, data.rows[1]]};

    await act(async () => {
        store.dispatch(screensApi.util.invalidateTags(["Screen"]));
    });
    await waitFor(() => expect(screen.queryByText("Alice")).not.toBeInTheDocument());

    expect(screen.getByRole("button", {name: "Approve proposals"})).toBeDisabled();
});

it("does not offer a bulk action for rows hidden by a language change", async () => {
    data.columns[0].dataType = "Object";
    data.rows = [
        {id: "alice", values: {0: {text: {en: "Alice", nl: "Andere naam"}}}},
        {id: "bob", values: {0: {text: {en: "Bob", nl: "Bob"}}}},
    ];
    const {i18n} = await openScreen();
    fireEvent.change(screen.getByRole("textbox", {name: "Type a search query"}), {
        target: {value: "Alice"},
    });
    fireEvent.click(screen.getByRole("checkbox", {name: "Select all rows"}));
    expect(screen.getByRole("button", {name: "Approve proposals"})).toBeEnabled();

    await act(async () => {
        await i18n.changeLanguage("nl");
    });

    expect(screen.queryByText("Andere naam")).not.toBeInTheDocument();
    expect(screen.getByRole("button", {name: "Voorstellen goedkeuren"})).toBeDisabled();
});

it("previews both sets, runs eligible rows only, refreshes once, and suppresses individual feedback", async () => {
    const {store} = await openScreen();
    fireEvent.click(screen.getByRole("checkbox", {name: "Select all rows"}));
    fireEvent.click(screen.getByRole("button", {name: "Approve proposals"}));
    const modal = await screen.findByRole("dialog");
    await within(modal).findByRole("heading", {name: "Will be applied"});
    expect(within(modal).getByRole("heading", {name: "Currently unavailable"})).toBeInTheDocument();
    expect(within(modal).getByText("Alice")).toBeInTheDocument();
    expect(within(modal).getByText("Bob")).toBeInTheDocument();
    expect(executions()).toHaveLength(0);
    fireEvent.click(within(modal).getByRole("button", {name: "Confirm"}));
    await within(modal).findByText("The action was executed successfully for 1 row.");
    expect(executions()).toHaveLength(1);
    expect(executions()[0][0].body.instanceIds).toEqual(["alice"]);
    await waitFor(() =>
        expect(
            request.mock.calls.filter(([arg]) => arg === "/Screens/Project/Projects"),
        ).toHaveLength(2),
    );
    expect(store.getState().effects.redirectUrl).toBeUndefined();
    expect(store.getState().effects.showConfetti).toBe(false);
    expect(store.getState().effects.toast).toBeUndefined();
});

it.each(["success", "uncertain outcome"])(
    "refreshes the personal overview after bulk execution with %s",
    async (outcome) => {
        if (outcome === "uncertain outcome") {
            executeResult = {error: {status: "FETCH_ERROR", error: "Connection lost"}};
        }
        const {store} = await openScreen();
        await act(async () => {
            await store.dispatch(personalApi.endpoints.getPersonalInstances.initiate());
        });
        expect(request.mock.calls.filter(([arg]) => arg === "/Personal/Instances")).toHaveLength(1);

        fireEvent.click(screen.getByRole("checkbox", {name: "Select row 1"}));
        fireEvent.click(screen.getByRole("button", {name: "Approve proposals"}));
        fireEvent.click(await confirmButton());

        await waitFor(() =>
            expect(
                request.mock.calls.filter(([arg]) => arg === "/Personal/Instances"),
            ).toHaveLength(2),
        );
        expect(executions()).toHaveLength(1);
    },
);

it.each([
    [
        "en",
        1,
        "The action “Approve proposals” is currently unavailable for the selected row. No changes will be made.",
        "Close",
    ],
    [
        "en",
        2,
        "The action “Approve proposals” is currently unavailable for all 2 selected rows. No changes will be made.",
        "Close",
    ],
    [
        "nl",
        1,
        "De actie ‘Voorstellen goedkeuren’ is momenteel niet mogelijk voor de geselecteerde rij. Er worden geen wijzigingen aangebracht.",
        "Sluiten",
    ],
    [
        "nl",
        2,
        "De actie ‘Voorstellen goedkeuren’ is momenteel niet mogelijk voor alle 2 geselecteerde rijen. Er worden geen wijzigingen aangebracht.",
        "Sluiten",
    ],
])(
    "explains when nothing can run in %s for %i selected rows",
    async (language, count, message, closeLabel) => {
        preview.rows = [
            {instanceId: "alice", status: "Unavailable"},
            {instanceId: "bob", status: "Unavailable"},
        ];
        await openScreen(language);
        fireEvent.click(
            screen.getByRole("checkbox", {
                name:
                    language === "en"
                        ? count === 1
                            ? "Select row 1"
                            : "Select all rows"
                        : count === 1
                          ? "Rij 1 selecteren"
                          : "Alle rijen selecteren",
            }),
        );
        fireEvent.click(
            screen.getByRole("button", {
                name: language === "en" ? "Approve proposals" : "Voorstellen goedkeuren",
            }),
        );
        const modal = await screen.findByRole("dialog");
        await within(modal).findByText(message);
        expect(within(modal).getByText("Alice")).toBeInTheDocument();
        expect(
            within(modal).queryByRole("button", {name: /^(Confirm|Bevestigen)$/}),
        ).not.toBeInTheDocument();
        expect(
            within(modal).queryByRole("button", {name: /^(Cancel|Annuleren)$/}),
        ).not.toBeInTheDocument();
        fireEvent.click(within(modal).getByRole("button", {name: closeLabel}));
        await waitFor(() => expect(screen.queryByRole("dialog")).not.toBeInTheDocument());
        expect(executions()).toHaveLength(0);
    },
);

it.each([
    ["en", "Select row 1", "Approve proposals", "You have selected 1 row."],
    ["nl", "Rij 1 selecteren", "Voorstellen goedkeuren", "Je hebt 1 rij geselecteerd."],
])(
    "uses singular confirmation copy for one eligible row in %s",
    async (language, selection, action, message) => {
        await openScreen(language);
        fireEvent.click(screen.getByRole("checkbox", {name: selection}));
        fireEvent.click(screen.getByRole("button", {name: action}));
        await screen.findByText((text) => text.startsWith(message));
        expect(
            screen.getByRole("button", {name: language === "en" ? "Confirm" : "Bevestigen"}),
        ).toBeEnabled();
    },
);

it("shows mixed execution results and never resubmits after completion", async () => {
    preview.rows[1].status = "Eligible";
    executeResult = {
        data: {
            rows: [
                {instanceId: "alice", status: "Succeeded"},
                {instanceId: "bob", status: "Failed"},
            ],
        },
    };
    await openScreen();
    fireEvent.click(screen.getByRole("checkbox", {name: "Select all rows"}));
    fireEvent.click(screen.getByRole("button", {name: "Approve proposals"}));
    fireEvent.click(await confirmButton());
    await screen.findByText(
        "Bulk action has completed with errors. The action was successful for 1 out of 2 rows. Please contact an administrator.",
    );
    const modal = screen.getByRole("dialog");
    expect(within(modal).getByText("Bob")).toBeInTheDocument();
    expect(within(modal).queryByText("Alice")).not.toBeInTheDocument();
    expect(screen.queryByRole("button", {name: "Confirm"})).not.toBeInTheDocument();
    expect(executions()).toHaveLength(1);
});

it("prevents dismissal during execution and reports uncertain results without offering a retry", async () => {
    const pending = Promise.withResolvers<unknown>();
    pendingExecution = pending.promise;
    await openScreen();
    fireEvent.click(screen.getByRole("checkbox", {name: "Select all rows"}));
    fireEvent.click(screen.getByRole("button", {name: "Approve proposals"}));
    fireEvent.click(await confirmButton());
    await screen.findByText("Applying action…");
    expect(screen.queryByRole("button", {name: "Cancel"})).not.toBeInTheDocument();
    fireEvent.keyDown(screen.getByRole("dialog"), {key: "Escape"});
    expect(screen.getByRole("dialog")).toBeInTheDocument();
    await act(async () =>
        pending.resolve({error: {status: "FETCH_ERROR", error: "Connection lost"}}),
    );
    await screen.findByText(/The result could not be confirmed/);
    expect(screen.queryByRole("button", {name: "Confirm"})).not.toBeInTheDocument();
    expect(executions()).toHaveLength(1);
});

it("keeps selection absent for screens without bulk configuration", async () => {
    delete data.bulkActions;
    await openScreen();
    expect(screen.queryByRole("checkbox")).not.toBeInTheDocument();
    expect(screen.queryByRole("button", {name: "Approve proposals"})).not.toBeInTheDocument();
});

it("shows the configured Dutch button and Dutch bulk confirmation", async () => {
    await openScreen("nl");
    fireEvent.click(screen.getByRole("checkbox", {name: "Alle rijen selecteren"}));
    fireEvent.click(screen.getByRole("button", {name: "Voorstellen goedkeuren"}));
    await screen.findByRole("heading", {name: "Wordt uitgevoerd"});
    expect(screen.getByText(/Je hebt 2 rijen geselecteerd/)).toBeInTheDocument();
});
