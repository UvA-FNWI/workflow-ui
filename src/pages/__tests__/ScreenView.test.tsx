import {createMemoryRouter, Link, RouterProvider} from "react-router";

import {act, cleanup, fireEvent, render, screen} from "@testing-library/react";
import {afterEach, expect, it, vi} from "vitest";

import {ScreenView} from "../ScreenView";
import type {ScreenRow} from "~/store/api/types/screens";

vi.mock("~/hooks/useTranslate", () => ({
    useTranslate: () => ({l: (value: {en: string}) => value.en}),
}));

vi.mock("~/store/api/screensApi", () => ({
    useGetScreenQuery: () => ({
        currentData: {
            workflowDefinition: {title: {en: "Projects"}},
            columns: [],
            rows: [],
            groups: [
                {name: "active", title: {en: "Active"}, rows: []},
                {
                    name: "completed",
                    title: {en: "Completed"},
                    rows: [{id: "project-1", values: {}}],
                },
            ],
        },
    }),
}));

vi.mock("~/components/ScreenTable", () => ({
    ScreenTable: ({rows}: {rows: ScreenRow[]}) =>
        rows.map((row) => (
            <Link key={row.id} to={`/instances/${row.id}`}>
                Open instance
            </Link>
        )),
}));

vi.mock("~/components/ScreenTable/ScreenTableToolbar.tsx", () => ({
    ScreenTableToolbar: () => null,
}));

afterEach(() => {
    cleanup();
    localStorage.clear();
});

function renderScreen() {
    const router = createMemoryRouter(
        [
            {path: "/screens/:workflowDefinition/:screenName", element: <ScreenView />},
            {path: "/instances/:instanceId", element: <div>Instance details</div>},
        ],
        {initialEntries: ["/screens/project/overview"]},
    );
    return {router, ...render(<RouterProvider router={router} />)};
}

it("returns to the selected tab after visiting an instance without changing the screen URL", async () => {
    const {router} = renderScreen();
    fireEvent.click(screen.getByRole("tab", {name: /Completed/}));
    expect(router.state.location.pathname).toBe("/screens/project/overview");
    expect(router.state.location.search).toBe("");

    fireEvent.click(screen.getByRole("link", {name: "Open instance"}));
    expect(await screen.findByText("Instance details")).toBeInTheDocument();
    await act(() => router.navigate(-1));

    expect(screen.getByRole("tab", {name: /Completed/})).toHaveAttribute("aria-selected", "true");
    expect(screen.getByRole("link", {name: "Open instance"})).toBeInTheDocument();
});

it("restores the saved tab when the app mounts again", () => {
    const {unmount} = renderScreen();
    fireEvent.click(screen.getByRole("tab", {name: /Completed/}));
    unmount();

    renderScreen();
    expect(screen.getByRole("tab", {name: /Completed/})).toHaveAttribute("aria-selected", "true");
});

it("keeps selections separate for each screen and workflow when routes reuse the page", async () => {
    const {router} = renderScreen();
    fireEvent.click(screen.getByRole("tab", {name: /Completed/}));

    await act(() => router.navigate("/screens/project/other"));
    expect(screen.getByRole("tab", {name: /Active/})).toHaveAttribute("aria-selected", "true");

    await act(() => router.navigate("/screens/other-workflow/overview"));
    expect(screen.getByRole("tab", {name: /Active/})).toHaveAttribute("aria-selected", "true");

    await act(() => router.navigate("/screens/project/overview"));
    expect(screen.getByRole("tab", {name: /Completed/})).toHaveAttribute("aria-selected", "true");
});
