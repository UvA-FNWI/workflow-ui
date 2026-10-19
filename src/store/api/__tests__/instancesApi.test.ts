import {configureStore} from "@reduxjs/toolkit";
import {beforeEach, describe, expect, it, vi} from "vitest";

import effectsReducer from "../../effectsSlice";
import {instancesApi} from "../instancesApi";

const {baseQuery} = vi.hoisted(() => ({baseQuery: vi.fn()}));

vi.mock("../baseApi", async () => {
    const {createApi} = await import("@reduxjs/toolkit/query/react");
    return {
        baseApi: createApi({
            reducerPath: "api",
            baseQuery,
            tagTypes: ["Instance", "Submission", "Assessments", "Choices", "Screen"],
            endpoints: () => ({}),
        }),
    };
});

const createStore = () =>
    configureStore({
        reducer: {api: instancesApi.reducer, effects: effectsReducer},
        middleware: (getDefault) => getDefault().concat(instancesApi.middleware),
    });

const request = {
    instanceId: "instance",
    changes: [{property: "DueDate", currentDate: "2026-10-01", date: "2026-10-03"}],
    reason: "because",
};

beforeEach(() => vi.clearAllMocks());

describe("Postponement effects", () => {
    it("applies returned confetti, toasts, redirects and task errors through the existing effect state", async () => {
        const result = {
            showConfetti: true,
            redirectUrl: "/overview",
            toast: {type: "Success", message: {en: "Done", nl: "Klaar"}},
            error: {message: "Mail failed", instanceId: "instance"},
        };
        baseQuery.mockResolvedValue({data: result});
        const store = createStore();

        await store.dispatch(instancesApi.endpoints.postponeDeadlines.initiate(request)).unwrap();

        expect(store.getState().effects).toEqual({
            ...result,
            error: {type: "warning", ...result.error},
        });
        store.dispatch(instancesApi.util.resetApiState());
    });

    it("does not apply effects for a rejected postponement", async () => {
        const error = {status: 409, data: {errorCode: "DeadlineChanged"}};
        baseQuery.mockResolvedValue({error});
        const store = createStore();

        await expect(
            store.dispatch(instancesApi.endpoints.postponeDeadlines.initiate(request)).unwrap(),
        ).rejects.toEqual(error);

        expect(store.getState().effects.showConfetti).toBe(false);
        store.dispatch(instancesApi.util.resetApiState());
    });
});
