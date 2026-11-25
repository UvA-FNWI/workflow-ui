import {useState} from "react";

import {Link, useParams, useSearchParams} from "react-router";

import {
    Button,
    Callout,
    Card,
    Container,
    Heading,
    Icon,
    LoadingSpinner,
    Pill,
    SearchInput,
} from "@uva-fnwi/datanose-ui";

import {BackLink} from "~/components/BackLink";
import {WorkflowDraftEditor} from "~/components/FormEditor/WorkflowDraftEditor";
import type {DraftLocation} from "~/components/FormEditor/WorkflowDraftOverview";
import {useDocumentTitle} from "~/hooks/useDocumentTitle";
import {useTranslate} from "~/hooks/useTranslate";
import {
    type AuthoringDraftSummary,
    authoringErrorMessage,
    type AuthoringProject,
    useGetAuthoringProjectDraftsQuery,
    useGetAuthoringProjectsQuery,
    useGetWorkflowDraftWorkspaceQuery,
    useOpenWorkflowDraftMutation,
} from "~/store/api/workflowDraftsApi";
import {formatDateTimeShort} from "~/utils/formatDate";

const rowLinkClass =
    "flex min-w-0 items-center justify-between gap-4 px-5 py-3.5 text-left hover:bg-navy-100 focus-visible:ring-2 focus-visible:ring-navy-600 focus-visible:ring-inset focus-visible:outline-none dark:hover:bg-navy-900 dark:focus-visible:ring-sky-400";

function ProjectAccess({project}: {project: AuthoringProject}) {
    const {t} = useTranslate("form_editor");
    return (
        <div className="flex flex-wrap gap-1.5">
            {project.canEdit && <Pill variant="grey">{t("authoring_edit_access")}</Pill>}
            {project.canMerge && <Pill variant="grey">{t("authoring_merge_access")}</Pill>}
        </div>
    );
}

function WorkflowList({projects}: {projects: AuthoringProject[]}) {
    const {t, i18n} = useTranslate("form_editor");
    const [search, setSearch] = useState("");
    const term = search.trim().toLocaleLowerCase(i18n.language);
    const visible = projects
        .filter(({title}) => title.toLocaleLowerCase(i18n.language).includes(term))
        .sort((first, second) => first.title.localeCompare(second.title, i18n.language));

    return (
        <Card padding="none">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-grey-300 bg-grey-100 px-5 py-3 dark:border-grey-700 dark:bg-grey-900">
                <div className="w-full sm:max-w-sm">
                    <SearchInput
                        aria-label={t("authoring_search_workflows")}
                        placeholder={t("authoring_search_workflows")}
                        value={search}
                        onChange={setSearch}
                    />
                </div>
                <p role="status" className="text-sm text-grey-700 dark:text-grey-300">
                    {t("authoring_workflow_count", {count: visible.length})}
                </p>
            </div>
            {visible.length === 0 ? (
                <div className="flex flex-wrap items-center gap-3 px-5 py-4">
                    <p className="text-sm text-grey-700 dark:text-grey-300">
                        {t("authoring_no_workflow_matches")}
                    </p>
                    <Button intent="ghost" size="small" onClick={() => setSearch("")}>
                        {t("authoring_clear_search")}
                    </Button>
                </div>
            ) : (
                <ul className="divide-y divide-grey-300 dark:divide-grey-700">
                    {visible.map((project) => (
                        <li key={project.id}>
                            <Link to={`/configure/${project.id}`} className={rowLinkClass}>
                                <div className="min-w-0 space-y-1.5">
                                    <div className="font-semibold">{project.title}</div>
                                    <ProjectAccess project={project} />
                                </div>
                                <Icon
                                    name="chevron-right-line"
                                    size="sm"
                                    className="shrink-0"
                                    decorative
                                />
                            </Link>
                        </li>
                    ))}
                </ul>
            )}
        </Card>
    );
}

function DraftRows({drafts, canEdit}: {drafts: AuthoringDraftSummary[]; canEdit: boolean}) {
    const {t, i18n} = useTranslate("form_editor");
    return (
        <ul className="divide-y divide-grey-300 dark:divide-grey-700">
            {drafts.map(({id, hasSavedChanges, updatedAt, pullRequest}) => {
                const status = pullRequest?.state;
                const statusLabel =
                    status === "open"
                        ? t("authoring_in_review")
                        : status === "closed"
                          ? t("authoring_closed")
                          : status === "merged"
                            ? t("authoring_merged_status")
                            : hasSavedChanges
                              ? t("authoring_changes_saved")
                              : t("authoring_no_saved_changes");
                return (
                    <li key={id}>
                        <Link to={`?draft=${encodeURIComponent(id)}`} className={rowLinkClass}>
                            <div className="min-w-0 space-y-1">
                                <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                                    <span className="font-semibold">{t("authoring_draft")}</span>
                                    <Pill
                                        variant={
                                            status === "open"
                                                ? "orange"
                                                : status === "merged" ||
                                                    (!status && hasSavedChanges)
                                                  ? "green"
                                                  : "grey"
                                        }
                                    >
                                        {statusLabel}
                                    </Pill>
                                </div>
                                {updatedAt && (
                                    <time
                                        dateTime={updatedAt}
                                        className="block text-sm text-grey-700 dark:text-grey-300"
                                    >
                                        {t("authoring_draft_updated", {
                                            date: formatDateTimeShort(updatedAt, i18n.language),
                                        })}
                                    </time>
                                )}
                            </div>
                            <span className="flex shrink-0 items-center gap-1 text-sm font-medium text-navy-800 dark:text-sky-200">
                                <span className="hidden sm:inline">
                                    {canEdit && status !== "closed" && status !== "merged"
                                        ? t("authoring_open_draft")
                                        : t("authoring_view_draft")}
                                </span>
                                <Icon
                                    name="chevron-right-line"
                                    size="sm"
                                    color="current"
                                    decorative
                                />
                            </span>
                        </Link>
                    </li>
                );
            })}
        </ul>
    );
}

function Draft({
    project,
    id,
    onDiscarded,
    location,
    onNavigate,
}: {
    project: AuthoringProject;
    id: string;
    onDiscarded: () => void;
    location: DraftLocation;
    onNavigate: (location: DraftLocation) => void;
}) {
    const {t} = useTranslate("form_editor");
    const {currentData, isError, refetch} = useGetWorkflowDraftWorkspaceQuery(
        {project: project.id, draft: id},
        {refetchOnMountOrArgChange: true},
    );
    if (!currentData)
        return isError ? (
            <Callout type="error">{t("authoring_error")}</Callout>
        ) : (
            <LoadingSpinner />
        );
    return (
        <WorkflowDraftEditor
            project={project}
            initial={currentData}
            reload={() => refetch().unwrap()}
            onDiscarded={onDiscarded}
            location={location}
            onNavigate={onNavigate}
        />
    );
}

function ProjectDrafts({project}: {project: AuthoringProject}) {
    const {t} = useTranslate("form_editor");
    const [search, setSearch] = useSearchParams();
    const selected = search.get("draft");
    const section = search.get("section");
    const {currentData, isError, refetch} = useGetAuthoringProjectDraftsQuery(project.id, {
        skip: selected !== null,
        refetchOnMountOrArgChange: true,
    });
    const [open, {isLoading}] = useOpenWorkflowDraftMutation();
    const [attempt, setAttempt] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [discardedId, setDiscardedId] = useState<string | null>(null);
    const drafts = currentData?.drafts?.filter(({id}) => id !== discardedId) ?? [];

    const start = async () => {
        if (!currentData) return;
        const id = attempt ?? `${currentData.baseSha}-${crypto.randomUUID().replaceAll("-", "")}`;
        setAttempt(id);
        setError(null);
        setDiscardedId(null);
        try {
            await open({project: project.id, draft: id}).unwrap();
            setAttempt(null);
            setSearch({draft: id});
        } catch (failure) {
            if ((failure as {data?: {error?: string}})?.data?.error === "DraftBaseChanged") {
                setAttempt(null);
                void refetch();
                setError(t("authoring_error_starting_version_changed"));
            } else {
                setError(authoringErrorMessage(failure, t));
            }
        }
    };

    return (
        <>
            <BackLink
                to={selected === null ? "/configure" : `/configure/${project.id}`}
                className="mb-4"
            >
                {selected === null ? t("authoring_back") : t("authoring_drafts")}
            </BackLink>
            <Heading as="h1" className="mb-4">
                {project.title}
            </Heading>
            {selected !== null ? (
                <Draft
                    key={selected}
                    project={project}
                    id={selected}
                    location={{
                        section: section === "forms" || section === "screens" ? section : undefined,
                        step: search.get("step") ?? undefined,
                        form: search.get("form") ?? undefined,
                    }}
                    onNavigate={(location) =>
                        setSearch((params) => {
                            const next = new URLSearchParams(params);
                            for (const key of ["section", "step", "form"] as const) {
                                const value = location[key];
                                if (value === undefined) next.delete(key);
                                else next.set(key, value);
                            }
                            return next;
                        })
                    }
                    onDiscarded={() => {
                        setDiscardedId(selected);
                        setSearch(
                            (params) => {
                                const next = new URLSearchParams(params);
                                next.delete("draft");
                                next.delete("section");
                                next.delete("step");
                                next.delete("form");
                                return next;
                            },
                            {replace: true},
                        );
                    }}
                />
            ) : isError ? (
                <Callout type="error">
                    <div className="flex flex-wrap items-center gap-3">
                        {t("authoring_error")}
                        <Button intent="secondary" size="small" onClick={() => void refetch()}>
                            {t("authoring_retry")}
                        </Button>
                    </div>
                </Callout>
            ) : currentData ? (
                <Card padding="none">
                    <div className="flex flex-wrap items-center justify-between gap-3 border-b border-grey-300 bg-grey-100 px-5 py-4 dark:border-grey-700 dark:bg-grey-900">
                        <div className="space-y-1.5">
                            <Heading as="h2" size="sm">
                                {t("authoring_drafts")}
                            </Heading>
                            <ProjectAccess project={project} />
                        </div>
                        {project.canEdit && (
                            <Button
                                intent="primary"
                                isLoading={isLoading}
                                leftIcon={
                                    <Icon name="plus-line" size="sm" color="current" decorative />
                                }
                                onClick={() => void start()}
                            >
                                {t("authoring_start")}
                            </Button>
                        )}
                    </div>
                    {(error || discardedId) && (
                        <div className="space-y-2 px-5 pt-4">
                            {error && <Callout type="error">{error}</Callout>}
                            {discardedId && (
                                <Callout type="success">{t("authoring_draft_discarded")}</Callout>
                            )}
                        </div>
                    )}
                    {drafts.length > 0 ? (
                        <DraftRows drafts={drafts} canEdit={project.canEdit} />
                    ) : (
                        <p className="px-5 py-6 text-sm text-grey-700 dark:text-grey-300">
                            {t("authoring_no_drafts")}
                        </p>
                    )}
                </Card>
            ) : (
                <LoadingSpinner />
            )}
        </>
    );
}

export default function WorkflowAuthoring() {
    const {t} = useTranslate("form_editor");
    const {projectId} = useParams();
    const [search] = useSearchParams();
    const {data, isError} = useGetAuthoringProjectsQuery();
    const project = data?.find(({id}) => id === projectId);
    useDocumentTitle(project ? `${project.title} · ${t("authoring_title")}` : t("authoring_title"));

    return (
        <Container maxWidth={project && search.has("draft") ? 1280 : 900}>
            {isError ? (
                <Callout type="error">{t("authoring_error")}</Callout>
            ) : !data ? (
                <LoadingSpinner />
            ) : project ? (
                <ProjectDrafts key={project.id} project={project} />
            ) : (
                <>
                    <Heading as="h1" className="mb-4">
                        {t("authoring_title")}
                    </Heading>
                    {projectId || !data.length ? (
                        <Callout type="info">{t("authoring_no_projects")}</Callout>
                    ) : (
                        <WorkflowList projects={data} />
                    )}
                </>
            )}
        </Container>
    );
}
