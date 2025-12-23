import {useLayoutEffect, useMemo, useRef} from "react";

import {debounce} from "lodash-es";

/**
 * A React hook that returns a debounced version of the given callback.
 *
 * The debounced function delays invoking the callback until after the specified delay
 * has elapsed since the last time the debounced function was called. If the component
 * re-renders, the callback reference is updated but the debounced function instance is
 * only recreated when the delay changes.
 *
 * @param callback - The function to debounce. This can take any number of arguments.
 * @param delay - The number of milliseconds to delay invoking the callback.
 * @returns A debounced version of the callback function.
 *
 * @example
 * const debouncedCallback = useDebounce(someFunction, 500);
 * debouncedCallback(value);
 */
export function useDebounce(callback: (...args: unknown[]) => void, delay: number) {
    const callbackRef = useRef(callback);
    const debouncedRef = useRef<ReturnType<typeof debounce> | undefined>(undefined);

    useLayoutEffect(() => {
        callbackRef.current = callback;
    }, [callback]);

    useLayoutEffect(() => {
        debouncedRef.current = debounce(
            (...args: unknown[]) => callbackRef.current(...args),
            delay,
        );

        return () => {
            debouncedRef.current?.cancel();
        };
    }, [delay]);

    return useMemo(
        () =>
            (...args: unknown[]) =>
                debouncedRef.current?.(...args),
        [],
    );
}
