import {useEffect, useRef} from "react";

import {useSearchParams} from "react-router";

import {VITE_AUTO_REFRESH_CONFIG, VITE_WEBAPI_URL} from "~/helpers/Environment";
import {API_TAG_TYPES, baseApi} from "~/store/api/baseApi";
import {useAppDispatch} from "~/store/store";
import {subscribeToConfigChanges} from "~/utils/configEvents";

export function useConfigAutoRefresh(accessToken: string | null) {
    const dispatch = useAppDispatch();
    const revision = useRef<string | null>(null);
    const [params] = useSearchParams();
    const version = params.get("version");

    useEffect(() => {
        if (VITE_AUTO_REFRESH_CONFIG !== "true" || !accessToken || version) return;

        const controller = new AbortController();
        void subscribeToConfigChanges({
            apiUrl: VITE_WEBAPI_URL || "",
            accessToken,
            signal: controller.signal,
            revision,
            onChange: () => {
                // Refetch active queries while retaining mounted components and the event stream.
                dispatch(baseApi.util.invalidateTags([...API_TAG_TYPES]));
            },
        }).catch((error) => {
            if (!controller.signal.aborted) console.debug("Config stream stopped", error);
        });

        return () => controller.abort();
    }, [accessToken, version, dispatch]);
}
