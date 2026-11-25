import {useRef, useState} from "react";

import {Callout} from "@uva-fnwi/datanose-ui";
import {parseDocument} from "yaml";

import {DraftFormSettings} from "~/components/FormEditor/DraftFormSettings";
import {FormEditorWorkspace} from "~/components/FormEditor/FormEditorWorkspace";
import {type ApplyFormEdit, parseConfigDocs} from "~/components/FormEditor/model";
import {useTranslate} from "~/hooks/useTranslate";
import type {
    DraftFormReference,
    WorkflowDraftWorkspace,
    WorkspaceEdits,
} from "~/store/api/workflowDraftsApi";

export function DraftWorkspaceEditor({
    workspace,
    form,
    pending,
    disabled,
    onEdit,
    onCloseSettings,
}: {
    workspace: WorkflowDraftWorkspace;
    form: DraftFormReference | undefined;
    pending: WorkspaceEdits;
    disabled: boolean;
    onEdit: (value: WorkspaceEdits) => void;
    onCloseSettings?: () => void;
}) {
    const {t} = useTranslate("form_editor");
    const edits = useRef(pending);
    const [docs, setDocs] = useState(() => parseConfigDocs({...workspace.files, ...pending.files}));
    const [error, setError] = useState<string | null>(null);
    const editable = new Set(workspace.editablePaths);

    const apply: ApplyFormEdit = async (action, source) => {
        setError(null);
        try {
            const touched = await action();
            if (touched.some((path) => !editable.has(path)))
                throw new Error(t("authoring_workspace_read_only"));
            const files = {...edits.current.files};
            const yamlFiles = new Set(edits.current.yamlFiles);
            for (const path of touched) {
                const text = docs.get(path)!.toString({lineWidth: 0});
                const raw = source === "yaml" || yamlFiles.has(path);
                if (
                    text === workspace.files[path] ||
                    (!raw && parseDocument(workspace.files[path]).toString({lineWidth: 0}) === text)
                ) {
                    delete files[path];
                    yamlFiles.delete(path);
                } else {
                    files[path] = text;
                    if (raw) yamlFiles.add(path);
                }
            }
            edits.current = {files, yamlFiles: Array.from(yamlFiles)};
            onEdit(edits.current);
        } catch (failure) {
            setDocs(parseConfigDocs({...workspace.files, ...edits.current.files}));
            setError(failure instanceof Error ? failure.message : t("mutation_failed"));
        }
    };

    if (!form) return null;
    const {path: formPath} = form;

    return (
        <div inert={disabled}>
            {error && (
                <Callout type="error" className="mb-3">
                    {error}
                </Callout>
            )}
            <FormEditorWorkspace
                key={formPath}
                docs={docs}
                formPath={formPath}
                apply={apply}
                localPreview
            />
            {onCloseSettings && (
                <DraftFormSettings
                    key={`settings:${formPath}`}
                    document={docs.get(formPath)!}
                    form={form}
                    steps={workspace.steps}
                    apply={apply}
                    onClose={onCloseSettings}
                    disabled={disabled}
                />
            )}
        </div>
    );
}
