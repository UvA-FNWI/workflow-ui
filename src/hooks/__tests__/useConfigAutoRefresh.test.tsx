import {createElement, type PropsWithChildren, useState} from "react";

import {Provider} from "react-redux";
import {MemoryRouter} from "react-router";

import {act, cleanup, renderHook, waitFor} from "@testing-library/react";
import {afterEach, beforeEach, describe, expect, it, vi} from "vitest";

import {useConfigAutoRefresh} from "../useConfigAutoRefresh";
import {baseApi} from "~/store/api/baseApi";
import {instancesEndpoints} from "~/store/api/instancesApi";
import {store} from "~/store/store";
import {subscribeToConfigChanges} from "~/utils/configEvents";

const environment = vi.hoisted(() => ({
    VITE_AUTO_REFRESH_CONFIG: "true",
    VITE_WEBAPI_URL: "http://localhost:5124",
}));
vi.mock("~/helpers/Environment", () => environment);
vi.mock("~/utils/configEvents", () => ({subscribeToConfigChanges: vi.fn()}));

beforeEach(() => {
    environment.VITE_AUTO_REFRESH_CONFIG = "true";
    vi.mocked(subscribeToConfigChanges)
        .mockReset()
        .mockImplementation(() => new Promise(() => {}));
});
afterEach(() => {
    cleanup();
    store.dispatch(baseApi.util.resetApiState());
    vi.unstubAllGlobals();
});

function router(path = "/") {
    return ({children}: PropsWithChildren) =>
        createElement(Provider, {
            store,
            children: createElement(MemoryRouter, {initialEntries: [path]}, children),
        });
}

describe("config auto refresh hook", () => {
    it("refetches changed step titles while preserving local state and the stream across saves", async () => {
        let title = "Original title";
        const fetch = vi.fn(
            async () =>
                new Response(
                    JSON.stringify({id: "instance", steps: [{id: "step", title: {en: title}}]}),
                    {
                        headers: {"Content-Type": "application/json"},
                    },
                ),
        );
        vi.stubGlobal("fetch", fetch);
        const {result} = renderHook(
            () => {
                useConfigAutoRefresh("token");
                const instance = instancesEndpoints.getInstance.useQuery("instance");
                const [draft, setDraft] = useState("");
                return {title: instance.data?.steps[0].title.en, draft, setDraft};
            },
            {wrapper: router("/instance/instance")},
        );
        await waitFor(() => expect(result.current.title).toBe("Original title"));
        act(() => result.current.setDraft("Unsaved input"));
        const connection = vi.mocked(subscribeToConfigChanges).mock.calls[0][0];

        title = "Updated title";
        act(() => connection.onChange());
        await waitFor(() => expect(result.current.title).toBe("Updated title"));
        expect(result.current.draft).toBe("Unsaved input");
        expect(connection.signal.aborted).toBe(false);

        title = "Another title";
        act(() => connection.onChange());
        await waitFor(() => expect(result.current.title).toBe("Another title"));
        expect(result.current.draft).toBe("Unsaved input");
        expect(fetch).toHaveBeenCalledTimes(3);
        expect(subscribeToConfigChanges).toHaveBeenCalledTimes(1);
    });

    it("stays disconnected unless explicitly enabled and authenticated", () => {
        environment.VITE_AUTO_REFRESH_CONFIG = "false";
        const disabled = renderHook(() => useConfigAutoRefresh("token"), {wrapper: router()});
        expect(subscribeToConfigChanges).not.toHaveBeenCalled();
        disabled.unmount();

        environment.VITE_AUTO_REFRESH_CONFIG = "true";
        renderHook(() => useConfigAutoRefresh(null), {wrapper: router()});
        expect(subscribeToConfigChanges).not.toHaveBeenCalled();
    });

    it("does not subscribe while viewing a named preview", () => {
        renderHook(() => useConfigAutoRefresh("token"), {
            wrapper: router("/develop?version=preview"),
        });
        expect(subscribeToConfigChanges).not.toHaveBeenCalled();
    });

    it("reconnects with a refreshed token, retains the revision, and cleans up on logout", () => {
        const {rerender} = renderHook(({token}) => useConfigAutoRefresh(token), {
            initialProps: {token: "old-token" as string | null},
            wrapper: router(),
        });
        const first = vi.mocked(subscribeToConfigChanges).mock.calls[0][0];
        first.revision.current = "revision-1";

        rerender({token: "new-token"});
        const next = vi.mocked(subscribeToConfigChanges).mock.calls[1][0];
        expect(first.signal.aborted).toBe(true);
        expect(next.accessToken).toBe("new-token");
        expect(next.revision.current).toBe("revision-1");

        rerender({token: null});
        expect(next.signal.aborted).toBe(true);
        expect(subscribeToConfigChanges).toHaveBeenCalledTimes(2);
    });

    it("cleans up the extra development StrictMode subscription", () => {
        const {unmount} = renderHook(() => useConfigAutoRefresh("token"), {
            wrapper: router(),
            reactStrictMode: true,
        });
        const calls = vi.mocked(subscribeToConfigChanges).mock.calls;
        expect(calls).toHaveLength(2);
        expect(calls[0][0].signal.aborted).toBe(true);
        expect(calls[1][0].signal.aborted).toBe(false);
        unmount();
        expect(calls[1][0].signal.aborted).toBe(true);
    });
});
