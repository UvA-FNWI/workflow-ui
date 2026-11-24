import {cleanup, renderHook} from "@testing-library/react";
import {afterEach, expect, it, vi} from "vitest";

import {useDebounce} from "../useDebounce";

afterEach(() => {
    cleanup();
    vi.useRealTimers();
});

it("discards a canceled call and can still schedule another", () => {
    vi.useFakeTimers();
    const callback = vi.fn();
    const {result} = renderHook(() => useDebounce(callback, 500));

    result.current("discarded");
    result.current.cancel();
    vi.advanceTimersByTime(500);
    expect(callback).not.toHaveBeenCalled();

    result.current("kept");
    vi.advanceTimersByTime(500);
    expect(callback).toHaveBeenCalledExactlyOnceWith("kept");
});
