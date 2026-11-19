import {useEffect, useState} from "react";

import {useLocation, useNavigationType, useSearchParams} from "react-router";

import {useDebounce} from "./useDebounce";

export function useHomeSearch() {
    const {key} = useLocation();
    const navigationType = useNavigationType();
    const [params, setParams] = useSearchParams();
    const urlInput = params.get("search") ?? "";
    const [draft, setDraft] = useState({key, value: urlInput});
    if (draft.key !== key) {
        // Keep typing through our URL replace. History navigation restores the URL's search.
        setDraft({key, value: navigationType === "REPLACE" ? draft.value : urlInput});
    }
    const input = draft.value;

    const commitSearch = useDebounce(() => {
        const nextParams = new URLSearchParams(params);
        if (input) nextParams.set("search", input);
        else nextParams.delete("search");

        setParams(nextParams, {replace: true, preventScrollReset: true});
    }, 500);

    useEffect(() => {
        if (input === urlInput) return;

        commitSearch();
        return commitSearch.cancel;
    }, [commitSearch, input, params, setParams, urlInput]);

    return {input, query: urlInput.trim(), setInput: (value: string) => setDraft({key, value})};
}
