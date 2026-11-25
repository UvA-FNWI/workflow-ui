import {useState} from "react";

import {
    Button,
    Callout,
    Card,
    cn,
    Heading,
    Icon,
    Menu,
    MenuItem,
    Modal,
} from "@uva-fnwi/datanose-ui";
import {parseDocument} from "yaml";

import {DraftWorkspaceEditor} from "~/components/FormEditor/DraftWorkspaceEditor";
import {readFormTitle} from "~/components/FormEditor/model";
import {WorkflowDraftChanges} from "~/components/FormEditor/WorkflowDraftChanges";
import {
    type DraftLocation,
    WorkflowDraftOverview,
} from "~/components/FormEditor/WorkflowDraftOverview";
import {FormModal} from "~/components/instance/FormModal";
import {useTranslate} from "~/hooks/useTranslate";
import type {Form} from "~/store/api/types/submissions";
import {
    authoringErrorMessage,
    type AuthoringProject,
    useDiscardWorkflowDraftMutation,
    useMergeWorkflowDraftMutation,
    usePreviewWorkflowDraftMutation,
    usePreviewWorkflowMutation,
    useProposeWorkflowDraftMutation,
    useSaveWorkflowDraftMutation,
    type WorkflowDraftWorkspace,
    type WorkspaceEdits,
} from "~/store/api/workflowDraftsApi";

const emptyEdits: WorkspaceEdits = {files: {}, yamlFiles: []};
const statusClass = "inline-flex items-center rounded-xs px-2 py-0.5 text-sm font-medium";

export function WorkflowDraftEditor({
    project,
    initial,
    reload,
    onDiscarded,
    location,
    onNavigate,
}: {
    project: AuthoringProject;
    initial: WorkflowDraftWorkspace;
    reload: () => Promise<WorkflowDraftWorkspace>;
    onDiscarded: () => void;
    location: DraftLocation;
    onNavigate: (location: DraftLocation) => void;
}) {
    const {t} = useTranslate("form_editor");
    const [lastRead, setLastRead] = useState(initial);
    const [saved, setSaved] = useState(initial);
    const [edits, setEdits] = useState(emptyEdits);
    const [workspaceVersion, setWorkspaceVersion] = useState(0);
    const [settingsForm, setSettingsForm] = useState<string | null>(null);
    const [preview, setPreview] = useState<Form | null>(null);
    const [workflowPreviewUrl, setWorkflowPreviewUrl] = useState<string | null>(null);
    const [error, setError] = useState<{message: string; compare: boolean} | null>(null);
    const [busy, setBusy] = useState(false);
    const [showChanges, setShowChanges] = useState(false);
    const [confirmDiscard, setConfirmDiscard] = useState(false);
    const [discardError, setDiscardError] = useState<string | null>(null);
    const [discard, {isLoading: discarding}] = useDiscardWorkflowDraftMutation();
    const [save] = useSaveWorkflowDraftMutation();
    const [loadPreview] = usePreviewWorkflowDraftMutation();
    const [loadWorkflowPreview] = usePreviewWorkflowMutation();
    const [propose] = useProposeWorkflowDraftMutation();
    const [merge] = useMergeWorkflowDraftMutation();
    const dirty = Object.keys(edits.files).length > 0;
    const {draft} = saved;
    const hasSavedChanges = draft.headSha !== draft.baseSha;
    const pr = draft.pullRequest;
    const closed = pr !== null && pr.state !== "open";
    const canUseWorkspace = project.canEdit && !closed && saved.editablePaths.length > 0;
    const canDiscard = project.canEdit && draft.hasBranch && pr?.state !== "merged";
    const canPropose = canUseWorkspace && pr === null && hasSavedChanges && !dirty;
    const head = {project: project.id, draft: draft.id, expectedHeadSha: draft.headSha};
    const forms = saved.forms.map((item) => {
        const pending = edits.files[item.path];
        const original = saved.files[item.path];
        if (!pending || !original) return item;
        const title = readFormTitle(parseDocument(pending));
        const savedTitle = readFormTitle(parseDocument(original));
        return title && (title.en !== savedTitle?.en || title.nl !== savedTitle?.nl)
            ? {...item, title}
            : item;
    });
    const form =
        location.section !== "screens"
            ? forms.find((item) => item.path === location.form)
            : undefined;
    const editableForm =
        canUseWorkspace && form && saved.editablePaths.includes(form.path) ? form : undefined;
    if (initial !== lastRead) {
        setLastRead(initial);
        if (!dirty && !busy) {
            setSaved(initial);
            setEdits(emptyEdits);
            setPreview(null);
        }
    }

    const run = async (action: () => Promise<void>) => {
        setError(null);
        setBusy(true);
        try {
            await action();
        } catch (failure) {
            const code = (failure as {data?: {error?: string}})?.data?.error;
            setError({
                message: authoringErrorMessage(failure, t),
                compare: dirty && code === "DraftHeadChanged",
            });
        } finally {
            setBusy(false);
        }
    };

    const persist = async () => {
        const result = await save({...head, ...edits}).unwrap();
        setSaved(result);
        setEdits(emptyEdits);
        setPreview(null);
    };

    const openWorkflowPreview = () => {
        const tab = window.open("about:blank", "_blank");
        if (tab) tab.opener = null;
        setWorkflowPreviewUrl(null);
        void run(async () => {
            try {
                const target = await loadWorkflowPreview({...head, ...edits}).unwrap();
                const path = target.screen
                    ? `/screens/${encodeURIComponent(target.definition)}/${encodeURIComponent(target.screen)}`
                    : "/";
                const url = `${path}?${new URLSearchParams({version: target.version})}`;
                if (tab) tab.location.href = url;
                else setWorkflowPreviewUrl(url);
            } catch (failure) {
                tab?.close();
                throw failure;
            }
        });
    };

    return (
        <Card className="flex flex-col gap-4">
            <header className="flex flex-wrap items-center justify-between gap-x-5 gap-y-3">
                <div className="min-w-0">
                    <Heading as="h2" size="sm">
                        {t("authoring_workflow_overview")}
                    </Heading>
                    <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-grey-700 dark:text-grey-300">
                        {!closed && (
                            <span
                                role="status"
                                className={cn(
                                    statusClass,
                                    dirty
                                        ? "bg-orange-100 text-orange-900 dark:bg-orange-900/35 dark:text-orange-200"
                                        : hasSavedChanges
                                          ? "bg-forest-100 text-forest-900 dark:bg-forest-900/40 dark:text-forest-200"
                                          : "bg-grey-200 text-grey-800 dark:bg-grey-900 dark:text-grey-200",
                                )}
                            >
                                {dirty
                                    ? t("authoring_unsaved_changes")
                                    : hasSavedChanges
                                      ? t("authoring_changes_saved")
                                      : t("authoring_no_saved_changes")}
                            </span>
                        )}
                    </div>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                    <Button intent="secondary" disabled={busy} onClick={openWorkflowPreview}>
                        {t("authoring_preview_workflow")}
                    </Button>
                    {canPropose ? (
                        <Button
                            intent="primary"
                            disabled={busy}
                            onClick={() =>
                                void run(async () =>
                                    setSaved({
                                        ...saved,
                                        draft: await propose(head).unwrap(),
                                    }),
                                )
                            }
                        >
                            {t("authoring_propose")}
                        </Button>
                    ) : (
                        canUseWorkspace &&
                        (dirty || pr === null) && (
                            <Button
                                intent="primary"
                                disabled={busy || !dirty}
                                onClick={() => void run(persist)}
                            >
                                {t(
                                    pr?.state === "open"
                                        ? "authoring_save_and_update_review"
                                        : "authoring_save",
                                )}
                            </Button>
                        )
                    )}
                    {(!closed || canDiscard) && (
                        <Menu
                            ariaLabel={t("authoring_draft_actions")}
                            trigger={({triggerProps, triggerRef}) => (
                                <Button
                                    {...triggerProps}
                                    ref={triggerRef}
                                    intent="ghost"
                                    size="square"
                                    className="min-w-9"
                                    disabled={busy}
                                    aria-label={t("authoring_draft_actions")}
                                >
                                    <Icon name="dots-single-line" decorative />
                                </Button>
                            )}
                        >
                            <MenuItem
                                id="reload"
                                label={t("authoring_reload")}
                                isDisabled={canUseWorkspace && dirty}
                                onAction={() =>
                                    void run(async () => {
                                        const latest = await reload();
                                        setSaved(latest);
                                        setEdits(emptyEdits);
                                    })
                                }
                            />
                            {dirty && (
                                <MenuItem
                                    id="discard-edits"
                                    label={t("authoring_discard_edits")}
                                    onAction={() => {
                                        setEdits(emptyEdits);
                                        setWorkspaceVersion((version) => version + 1);
                                    }}
                                />
                            )}
                            {canDiscard && (
                                <MenuItem
                                    id="discard-draft"
                                    icon="trash-line"
                                    className="text-red-700 dark:text-red-400"
                                    label={t("authoring_discard_draft")}
                                    onAction={() => {
                                        setDiscardError(null);
                                        setConfirmDiscard(true);
                                    }}
                                />
                            )}
                        </Menu>
                    )}
                </div>
            </header>
            {workflowPreviewUrl && (
                <a
                    href={workflowPreviewUrl}
                    className="self-start text-sm underline"
                    target="_blank"
                    rel="noreferrer"
                >
                    {t("authoring_open_workflow_preview")}
                </a>
            )}
            {error && (
                <Callout type="error">
                    <p>{error.message}</p>
                    {error.compare && (
                        <a
                            className="underline"
                            href={window.location.href}
                            target="_blank"
                            rel="noreferrer"
                        >
                            {t("authoring_compare_in_new_tab")}
                        </a>
                    )}
                </Callout>
            )}
            {(hasSavedChanges || pr) && (
                <section
                    aria-label={t("authoring_draft_review")}
                    className="flex flex-wrap items-center justify-between gap-x-5 gap-y-3 rounded-sm border border-navy-200 bg-navy-100/60 px-4 py-3 dark:border-navy-700 dark:bg-navy-900/40"
                >
                    <div className="min-w-0 space-y-1">
                        <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1">
                            <h3 className="font-semibold text-navy-900 dark:text-sky-100">
                                {t("authoring_draft_review")}
                            </h3>
                            {pr && (
                                <span
                                    role="status"
                                    className={cn(
                                        statusClass,
                                        pr.state === "open"
                                            ? "bg-navy-200 text-navy-900 dark:bg-navy-800 dark:text-sky-100"
                                            : pr.state === "merged"
                                              ? "bg-forest-100 text-forest-900 dark:bg-forest-900/40 dark:text-forest-200"
                                              : "bg-grey-200 text-grey-800 dark:bg-grey-800 dark:text-grey-200",
                                    )}
                                >
                                    {pr.state === "open"
                                        ? t("authoring_in_review")
                                        : pr.state === "merged"
                                          ? t("authoring_merged_status")
                                          : t("authoring_closed")}
                                </span>
                            )}
                        </div>
                        <p className="text-sm text-grey-700 dark:text-grey-300">
                            {pr?.state === "merged"
                                ? t("authoring_release_status_unknown")
                                : pr?.state === "open" && dirty
                                  ? t("authoring_update_review_hint")
                                  : t("authoring_compare_saved_hint")}
                        </p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                        {hasSavedChanges && (
                            <Button
                                intent="primary"
                                disabled={busy}
                                leftIcon={
                                    <Icon
                                        name="file-chart-line"
                                        size="sm"
                                        color="current"
                                        decorative
                                    />
                                }
                                onClick={() => setShowChanges(true)}
                            >
                                {t("authoring_review_changes")}
                            </Button>
                        )}
                        {project.canMerge && pr?.state === "open" && (
                            <Button
                                intent="secondary"
                                disabled={busy || dirty || pr.headSha !== draft.headSha}
                                onClick={() =>
                                    void run(async () =>
                                        setSaved({...saved, draft: await merge(head).unwrap()}),
                                    )
                                }
                            >
                                {t("authoring_merge")}
                            </Button>
                        )}
                    </div>
                </section>
            )}
            {(draft.baseCommitUrl || pr) && (
                <details className="self-start text-sm text-grey-700 dark:text-grey-300">
                    <summary className="cursor-pointer">{t("authoring_technical_details")}</summary>
                    <ul className="mt-1 space-y-1 pl-4">
                        {draft.baseCommitUrl && (
                            <li>
                                <a
                                    className="underline"
                                    href={draft.baseCommitUrl}
                                    target="_blank"
                                    rel="noreferrer"
                                >
                                    {t("authoring_started_from", {sha: draft.baseSha.slice(0, 8)})}
                                </a>
                            </li>
                        )}
                        {pr && (
                            <li>
                                <a
                                    className="underline"
                                    href={pr.url}
                                    target="_blank"
                                    rel="noreferrer"
                                >
                                    {t("authoring_pull_request", {number: pr.number})}
                                </a>
                            </li>
                        )}
                    </ul>
                </details>
            )}
            {showChanges && (
                <WorkflowDraftChanges head={head} onClose={() => setShowChanges(false)} />
            )}
            <Modal
                size="sm"
                aria-label={t("authoring_discard_draft")}
                isOpen={confirmDiscard}
                onOpenChange={(open) => {
                    if (!discarding) setConfirmDiscard(open);
                }}
            >
                <Modal.Header>{t("authoring_discard_draft")}</Modal.Header>
                <Modal.Body className="space-y-3">
                    <p>
                        {pr?.state === "open"
                            ? t("authoring_discard_proposal")
                            : t("authoring_discard_branch")}
                    </p>
                    {dirty && <p>{t("authoring_discard_pending")}</p>}
                    {discardError && <Callout type="error">{discardError}</Callout>}
                </Modal.Body>
                <Modal.Footer>
                    <Button
                        intent="secondary"
                        disabled={discarding}
                        onClick={() => setConfirmDiscard(false)}
                    >
                        {t("cancel", {ns: "common"})}
                    </Button>
                    <Button
                        intent="primary"
                        variant="destructive"
                        isLoading={discarding}
                        onClick={async () => {
                            setDiscardError(null);
                            try {
                                await discard({
                                    ...head,
                                    pullRequestNumber: pr?.number ?? null,
                                }).unwrap();
                                onDiscarded();
                            } catch (failure) {
                                setDiscardError(authoringErrorMessage(failure, t));
                            }
                        }}
                    >
                        {t("authoring_discard_draft")}
                    </Button>
                </Modal.Footer>
            </Modal>
            <WorkflowDraftOverview
                workspace={{...saved, forms}}
                location={location}
                form={form}
                onNavigate={(next) => {
                    setSettingsForm(null);
                    onNavigate(next);
                }}
                disabled={busy}
                formActions={
                    form && (
                        <div className="flex flex-wrap gap-2">
                            {editableForm && (
                                <Button
                                    intent="secondary"
                                    size="small"
                                    disabled={busy}
                                    leftIcon={
                                        <Icon
                                            name="settings-gear-line"
                                            size="xs"
                                            color="current"
                                            decorative
                                        />
                                    }
                                    onClick={() => setSettingsForm(editableForm.path)}
                                >
                                    {t("authoring_form_settings")}
                                </Button>
                            )}
                            <Button
                                intent="secondary"
                                size="small"
                                disabled={busy}
                                onClick={() =>
                                    void run(async () =>
                                        setPreview(
                                            await loadPreview({
                                                ...head,
                                                ...edits,
                                                formPath: form.path,
                                            }).unwrap(),
                                        ),
                                    )
                                }
                            >
                                {t("authoring_preview")}
                            </Button>
                        </div>
                    )
                }
            >
                {canUseWorkspace && (
                    <DraftWorkspaceEditor
                        key={`${draft.headSha}:${workspaceVersion}`}
                        workspace={saved}
                        form={editableForm}
                        pending={edits}
                        disabled={busy}
                        onEdit={(next) => {
                            setEdits(next);
                            setWorkflowPreviewUrl(null);
                        }}
                        onCloseSettings={
                            editableForm && settingsForm === editableForm.path
                                ? () => setSettingsForm(null)
                                : undefined
                        }
                    />
                )}
            </WorkflowDraftOverview>
            {preview && <FormModal previewForm={preview} onClose={() => setPreview(null)} />}
        </Card>
    );
}
