import {Provider} from "react-redux";

import {configureStore, type Middleware} from "@reduxjs/toolkit";
import {act, cleanup, fireEvent, render, screen, within} from "@testing-library/react";
import {afterEach, expect, it, vi} from "vitest";

import {UserPickerInput} from "../UserPickerInput";
import {baseApi} from "~/store/api/baseApi";

const request = vi.hoisted(() => vi.fn());

vi.mock("~/store/api/baseApi", async () => {
    const {createApi} = await import("@reduxjs/toolkit/query/react");
    return {
        baseApi: createApi({baseQuery: request, endpoints: () => ({})}),
    };
});

vi.mock("~/hooks/useTranslate", () => ({
    useTranslate: () => ({t: (key: string) => key}),
}));

afterEach(() => {
    cleanup();
    vi.useRealTimers();
    request.mockReset();
});

it.each([
    ["submission", "Reviewer", "/Answers/instance/submission/Reviewer/UserSearch"],
    [
        undefined,
        "Course.Reviewer",
        "/WorkflowInstances/instance/Properties/Course.Reviewer/UserSearch",
    ],
])(
    "waits for two characters and shows field results without extra labels (%s)",
    async (submissionId, property, url) => {
        const store = configureStore({
            reducer: {[baseApi.reducerPath]: baseApi.reducer},
            middleware: (getDefaultMiddleware) =>
                getDefaultMiddleware().concat(baseApi.middleware as Middleware),
        });
        const onSelectionChange = vi.fn();
        request
            .mockResolvedValueOnce({
                data: [
                    {label: "DataNose", users: []},
                    {
                        label: "Course.Supervisors",
                        users: [
                            {
                                userName: "ada",
                                displayName: "Ada Lovelace",
                                isExternal: false,
                                organization: {name: "University of Amsterdam"},
                            },
                            {userName: "guest", displayName: "Guest", isExternal: true},
                        ],
                    },
                ],
            })
            .mockResolvedValueOnce({
                data: [
                    {label: "DataNose", users: [{userName: "grace", displayName: "Grace Hopper"}]},
                    {label: "Course.Supervisors", users: []},
                ],
            });

        vi.useFakeTimers();
        render(
            <Provider store={store}>
                <UserPickerInput
                    field={{
                        instanceId: "instance",
                        submissionId,
                        property,
                    }}
                    onSelectionChange={onSelectionChange}
                />
            </Provider>,
        );

        await act(() => vi.advanceTimersByTimeAsync(300));
        expect(request).not.toHaveBeenCalled();

        const searchInput = screen.getByPlaceholderText("user_picker.search_placeholder");
        fireEvent.change(searchInput, {target: {value: " A "}});
        await act(() => vi.advanceTimersByTimeAsync(300));
        expect(request).not.toHaveBeenCalled();

        vi.useRealTimers();
        fireEvent.change(searchInput, {target: {value: "Ad"}});
        const ada = await screen.findByRole("option", {name: /Ada Lovelace/});
        expect(within(ada).getByText("University of Amsterdam")).toBeInTheDocument();
        expect(
            screen.queryByText(/DataNose|Course\.Supervisors|search_sources/),
        ).not.toBeInTheDocument();
        expect(screen.getByRole("option", {name: /Guest/})).toBeInTheDocument();
        fireEvent.click(ada);
        expect(screen.queryByText("user_picker.selected_users")).not.toBeInTheDocument();
        expect(onSelectionChange).toHaveBeenLastCalledWith([
            expect.objectContaining({userName: "ada"}),
        ]);
        expect(request).toHaveBeenNthCalledWith(
            1,
            {url, params: {query: "Ad"}},
            expect.anything(),
            undefined,
        );

        fireEvent.change(searchInput, {target: {value: "Grace"}});
        const grace = await screen.findByRole("option", {name: /Grace Hopper/});
        expect(
            screen.queryByText(/DataNose|Course\.Supervisors|search_sources/),
        ).not.toBeInTheDocument();
        expect(screen.queryByRole("option", {name: /Ada Lovelace/})).not.toBeInTheDocument();
        fireEvent.click(grace);

        expect(request).toHaveBeenNthCalledWith(
            2,
            {url, params: {query: "Grace"}},
            expect.anything(),
            undefined,
        );
        expect(onSelectionChange).toHaveBeenLastCalledWith([
            expect.objectContaining({userName: "grace"}),
        ]);
    },
);
