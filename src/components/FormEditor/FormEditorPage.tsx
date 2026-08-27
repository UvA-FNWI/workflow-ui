import {useState} from "react";

import {Navigate, useParams} from "react-router";

import {
    Button,
    Callout,
    Card,
    Container,
    Heading,
    Icon,
    LoadingSpinner,
    Modal,
    Pill,
} from "@uva-fnwi/datanose-ui";

import {BackLink} from "~/components/BackLink";
import {addPage, deletePage, readPages, schemaNameForPath} from "~/components/FormEditor/model";
import {NodeYamlEditor} from "~/components/FormEditor/NodeYamlEditor";
import {PageSection} from "~/components/FormEditor/PageSection";
import {useConfigFiles} from "~/components/FormEditor/useConfigFiles";
import {useDocumentTitle} from "~/hooks/useDocumentTitle";
import {useTranslate} from "~/hooks/useTranslate";
import {useUploadConfigVersionMutation} from "~/store/api/configApi";
import {useGetCurrentUserQuery} from "~/store/api/usersApi";

/** Whole files are completed against the schema for their location, exactly as workflow-dev maps them. */
const schemaNameFor = (path: string) => {
    const name = schemaNameForPath(path);
    return name ? {name} : undefined;
};

export function FormEditorPage() {
    const {t, l} = useTranslate(["form_editor", "common"]);
    const {definition = "", form = ""} = useParams();
    const {data: currentUser, isLoading: isUserLoading} = useGetCurrentUserQuery();
    const {docs, isLoading, error, dirtyPaths, markDirty, reparse, allFiles} = useConfigFiles();
    const [upload, {isLoading: isUploading}] = useUploadConfigVersionMutation();
    const [activePage, setActivePage] = useState(0);
    const [isFormYamlOpen, setIsFormYamlOpen] = useState(false);
    const [areFilesOpen, setAreFilesOpen] = useState(false);
    const [failure, setFailure] = useState<string | null>(null);

    useDocumentTitle(t("title"));

    if (isUserLoading) {
        return null;
    }
    if (!currentUser?.isSuperAdmin) {
        return <Navigate to="/" replace />;
    }
    if (error) {
        return (
            <Container maxWidth={1280}>
                <Callout type="error">{t("load_failed")}</Callout>
            </Container>
        );
    }
    if (isLoading || !docs) {
        return (
            <Container maxWidth={1280}>
                <LoadingSpinner />
            </Container>
        );
    }

    const formPath = `${definition}/Forms/${form}.yaml`;

    if (!docs.has(formPath)) {
        return (
            <Container maxWidth={1280}>
                <BackLink to="/develop" className="mb-4">
                    {t("back")}
                </BackLink>
                <Callout type="error">{t("form_not_found", {path: formPath})}</Callout>
            </Container>
        );
    }

    const pages = readPages(docs, formPath);
    const page = pages[Math.min(activePage, pages.length - 1)];
    const changed = [...dirtyPaths];
    const previewVersion = `edit-${definition.split("/").at(-1)}-${form}`;

    /** Every mutation goes through here: run it, record the touched files, surface any failure. */
    const apply = (action: () => string[]) => {
        try {
            setFailure(null);
            markDirty(action());
        } catch (mutationError) {
            setFailure(
                mutationError instanceof Error ? mutationError.message : t("mutation_failed"),
            );
        }
    };

    const onPreview = async () => {
        setFailure(null);
        const previewTab = window.open("about:blank", "_blank");
        if (previewTab) previewTab.opener = null;

        const result = await upload({version: previewVersion, files: allFiles(docs)});
        if ("error" in result) {
            previewTab?.close();
            const data = (result.error as {data?: unknown}).data;
            setFailure(typeof data === "string" ? data : t("preview_failed"));
            return;
        }

        const url = `/develop?version=${encodeURIComponent(previewVersion)}`;
        if (previewTab) previewTab.location.href = url;
        else window.open(url, "_blank", "noopener,noreferrer");
    };

    return (
        <Container maxWidth={1280}>
            <BackLink to="/develop" className="mb-4">
                {t("back")}
            </BackLink>

            <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                <div>
                    <Heading as="h1">{form}</Heading>
                    <p className="text-sm text-grey-600">{definition}</p>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                    <Button
                        intent="ghost"
                        onClick={() => setAreFilesOpen(true)}
                        disabled={changed.length === 0}
                        leftIcon={<Icon name="code-line" size="sm" color="current" decorative />}
                    >
                        {t("changed_files")}
                        {changed.length > 0 && (
                            <Pill variant="orange" className="ml-2">
                                {changed.length}
                            </Pill>
                        )}
                    </Button>
                    <Button
                        intent="primary"
                        onClick={onPreview}
                        isLoading={isUploading}
                        loadingText={t("preview")}
                    >
                        {t("preview")}
                    </Button>
                </div>
            </div>

            {failure && (
                <Callout type="error" className="mb-4" role="alert">
                    {failure}
                </Callout>
            )}

            <Card>
                <div className="grid gap-6 md:grid-cols-[13rem_1fr]">
                    <nav
                        aria-label={t("pages")}
                        className="md:border-r md:border-grey-200 md:pr-4 md:dark:border-grey-700"
                    >
                        <div className="mb-2 flex items-center justify-between">
                            <p className="text-xs font-medium tracking-wide text-grey-500 uppercase">
                                {t("pages")}
                            </p>
                            <Button
                                intent="ghost"
                                size="square"
                                aria-label={t("edit_form_yaml")}
                                onClick={() => setIsFormYamlOpen(true)}
                            >
                                <Icon name="code-brackets-line" size="sm" decorative />
                            </Button>
                        </div>
                        <ul className="flex flex-row gap-1 overflow-x-auto md:flex-col">
                            {pages.map((item, index) => (
                                <li key={item.name} className="flex items-center gap-1">
                                    <button
                                        type="button"
                                        aria-current={index === activePage}
                                        onClick={() => setActivePage(index)}
                                        className={`w-full rounded-xs px-2 py-1.5 text-left text-sm whitespace-nowrap focus-visible:ring-2 focus-visible:ring-navy-600 focus-visible:outline-none ${
                                            index === activePage
                                                ? "bg-navy-50 font-medium text-navy-800 dark:bg-grey-700 dark:text-white"
                                                : "hover:bg-grey-100 dark:hover:bg-grey-800"
                                        }`}
                                    >
                                        {l(item.title) || item.name}
                                    </button>
                                    <Button
                                        intent="ghost"
                                        size="square"
                                        aria-label={t("delete_page", {
                                            title: l(item.title) || item.name,
                                        })}
                                        onClick={() => {
                                            apply(() => deletePage(docs, formPath, item.name));
                                            setActivePage((current) =>
                                                Math.max(0, Math.min(current, pages.length - 2)),
                                            );
                                        }}
                                    >
                                        <Icon name="trash-line" size="sm" decorative />
                                    </Button>
                                </li>
                            ))}
                        </ul>
                        <Button
                            intent="secondary"
                            size="small"
                            className="mt-2 w-full"
                            leftIcon={
                                <Icon name="plus-line" size="sm" color="current" decorative />
                            }
                            onClick={() =>
                                apply(() => addPage(docs, formPath, t("new_page")).touched)
                            }
                        >
                            {t("add_page")}
                        </Button>
                    </nav>

                    <div className="min-w-0">
                        {page ? (
                            <PageSection
                                key={page.name}
                                docs={docs}
                                formPath={formPath}
                                pageName={page.name}
                                pageTitle={page.title}
                                apply={apply}
                            />
                        ) : (
                            <p className="text-sm text-grey-600">{t("no_pages")}</p>
                        )}
                    </div>
                </div>
            </Card>

            <Modal
                isOpen={isFormYamlOpen}
                onOpenChange={setIsFormYamlOpen}
                size="xl"
                aria-label={t("edit_form_yaml")}
            >
                {/* Modal.Header renders its own h2, so pass text rather than another Heading. */}
                <Modal.Header>{formPath}</Modal.Header>
                <Modal.Body>
                    <NodeYamlEditor
                        minHeight="24rem"
                        schema={schemaNameFor(formPath)}
                        initialText={docs.get(formPath)?.toString() ?? ""}
                        onChange={(text) => reparse(docs, formPath, text)}
                    />
                </Modal.Body>
            </Modal>

            <Modal
                isOpen={areFilesOpen}
                onOpenChange={setAreFilesOpen}
                size="xl"
                aria-label={t("changed_files")}
            >
                <Modal.Header>{t("changed_files")}</Modal.Header>
                <Modal.Body>
                    <div className="flex flex-col gap-4">
                        {changed.map((path) => (
                            <div key={path}>
                                <p className="mb-1 text-sm font-medium">{path}</p>
                                <NodeYamlEditor
                                    minHeight="12rem"
                                    schema={schemaNameFor(path)}
                                    initialText={docs.get(path)?.toString() ?? ""}
                                    onChange={(text) => reparse(docs, path, text)}
                                />
                            </div>
                        ))}
                    </div>
                </Modal.Body>
            </Modal>
        </Container>
    );
}

export default FormEditorPage;
