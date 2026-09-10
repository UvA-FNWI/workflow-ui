import {act, cleanup, renderHook} from "@testing-library/react";
import {afterEach, beforeEach, describe, expect, it, vi} from "vitest";

import {useDebounce} from "../useDebounce";

beforeEach(() => vi.useFakeTimers());
afterEach(() => {
    cleanup();
    vi.useRealTimers();
});

describe("useDebounce", () => {
    it("cancels pending callbacks on unmount by default", () => {
        const callback = vi.fn();
        const {result, unmount} = renderHook(() => useDebounce(callback, 500));
        act(() => result.current("search"));
        unmount();
        act(() => vi.runAllTimers());
        expect(callback).not.toHaveBeenCalled();
    });

    it("flushes only the latest pending value on unmount when enabled", () => {
        const callback = vi.fn();
        const {result, unmount} = renderHook(() =>
            useDebounce(callback, 500, {flushOnUnmount: true}),
        );
        act(() => {
            result.current("first");
            vi.advanceTimersByTime(200);
            result.current("latest");
        });
        expect(callback).not.toHaveBeenCalled();
        unmount();
        expect(callback).toHaveBeenCalledExactlyOnceWith("latest");
        act(() => vi.runAllTimers());
        expect(callback).toHaveBeenCalledOnce();
    });

    it("still debounces while mounted and does not repeat a completed save on unmount", () => {
        const callback = vi.fn();
        const {result, unmount} = renderHook(() =>
            useDebounce(callback, 500, {flushOnUnmount: true}),
        );
        act(() => result.current("answer"));
        act(() => vi.advanceTimersByTime(499));
        expect(callback).not.toHaveBeenCalled();
        act(() => vi.advanceTimersByTime(1));
        expect(callback).toHaveBeenCalledExactlyOnceWith("answer");
        unmount();
        expect(callback).toHaveBeenCalledOnce();
    });
});
