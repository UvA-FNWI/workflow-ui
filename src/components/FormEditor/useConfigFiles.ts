import {useCallback, useMemo, useState} from "react";

import {parseDocument} from "yaml";

import {parseConfigDocs, serializeConfigDocs} from "~/components/FormEditor/model";
import type {ConfigDocs} from "~/components/FormEditor/model";
import {useGetConfigFilesQuery} from "~/store/api/configApi";

const LAYOUT_PATH = "Layouts/default.html";

/**
 * Loads every config file once and keeps the parsed Documents for the lifetime of the editor.
 * Mutations happen in place on those Documents, so a version counter is what tells React to re-render.
 */
export function useConfigFiles() {
    const {data, isLoading, error} = useGetConfigFilesQuery();
    const [dirtyState, setDirtyState] = useState({
        data: undefined as Record<string, string> | undefined,
        paths: new Set<string>(),
        revision: 0,
    });

    const parsed = useMemo(() => {
        if (!data) {
            return null;
        }
        return {docs: parseConfigDocs(data), layout: data[LAYOUT_PATH] ?? ""};
    }, [data]);

    const dirtyPaths = dirtyState.data === data ? dirtyState.paths : new Set<string>();
    const revision = dirtyState.data === data ? dirtyState.revision : 0;

    const markDirty = useCallback(
        (paths: string[]) => {
            setDirtyState((previous) => {
                const isCurrentData = previous.data === data;
                const next = new Set(isCurrentData ? previous.paths : []);
                paths.forEach((path) => next.add(path));
                return {
                    data,
                    paths: next,
                    revision: isCurrentData ? previous.revision + 1 : 1,
                };
            });
        },
        [data],
    );

    /** Replace one file's Document from edited text. Returns the parse error, or null on success. */
    const reparse = useCallback(
        (docs: ConfigDocs, path: string, text: string): string | null => {
            if (path === LAYOUT_PATH) {
                return "Layouts/default.html is not a YAML document";
            }
            const doc = parseDocument(text);
            if (doc.errors.length > 0) {
                return doc.errors[0].message;
            }
            docs.set(path, doc);
            markDirty([path]);
            return null;
        },
        [markDirty],
    );

    const allFiles = useCallback(
        (docs: ConfigDocs): Record<string, string> => ({
            ...serializeConfigDocs(docs),
            [LAYOUT_PATH]: parsed?.layout ?? "",
        }),
        [parsed],
    );

    return {
        docs: parsed?.docs ?? null,
        layout: parsed?.layout ?? "",
        isLoading,
        error,
        dirtyPaths,
        markDirty,
        reparse,
        allFiles,
        revision,
    };
}
