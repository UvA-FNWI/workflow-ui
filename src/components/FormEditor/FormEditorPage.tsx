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
} from "@uva-fnwi/datanose-ui";

import {BackLink} from "~/components/BackLink";
import {FormEditorWorkspace} from "~/components/FormEditor/FormEditorWorkspace";
import {schemaNameForPath} from "~/components/FormEditor/model";
import {NodeYamlEditor} from "~/components/FormEditor/NodeYamlEditor";
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
    const {t} = useTranslate(["form_editor", "common"]);
    const {definition = "", form = ""} = useParams();
    const {data: currentUser, isLoading: isUserLoading} = useGetCurrentUserQuery();
    const {docs, isLoading, error, dirtyPaths, markDirty, reparse, allFiles} = useConfigFiles();
    const [upload, {isLoading: isUploading}] = useUploadConfigVersionMutation();
    const [failure, setFailure] = useState<string | null>(null);
    const [isFormYamlOpen, setIsFormYamlOpen] = useState(false);
    const [areFilesOpen, setAreFilesOpen] = useState(false);

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

    const previewVersion = `edit-${definition.split("/").at(-1)}-${form}`;

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
                <FormEditorWorkspace
                    docs={docs}
                    formPath={formPath}
                    pageTools={
                        <>
                            <Button
                                intent="ghost"
                                size="square"
                                aria-label={t("edit_form_yaml")}
                                onClick={() => setIsFormYamlOpen(true)}
                            >
                                <Icon name="code-brackets-line" size="sm" decorative />
                            </Button>

                            {dirtyPaths.size > 0 && (
                                <Button
                                    intent="ghost"
                                    size="square"
                                    aria-label={t("changed_files")}
                                    onClick={() => setAreFilesOpen(true)}
                                >
                                    <Icon name="square-edit-line" size="sm" decorative />
                                </Button>
                            )}
                        </>
                    }
                    apply={async (action) => {
                        try {
                            setFailure(null);
                            markDirty(await action());
                        } catch (error) {
                            setFailure(
                                error instanceof Error ? error.message : t("mutation_failed"),
                            );
                        }
                    }}
                />
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
                        {[...dirtyPaths].map((path) => (
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
