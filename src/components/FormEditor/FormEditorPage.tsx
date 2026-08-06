import {useState} from "react";

import {Navigate, useParams} from "react-router";

import {
    Button,
    Callout,
    Card,
    Container,
    Heading,
    LoadingSpinner,
    Tab,
    TabList,
    TabPanel,
    TabPanels,
    Tabs,
} from "@uva-fnwi/datanose-ui";

import {BackLink} from "~/components/BackLink";
import {readPages} from "~/components/FormEditor/model";
import {QuestionList} from "~/components/FormEditor/QuestionList";
import {useConfigFiles} from "~/components/FormEditor/useConfigFiles";
import {YamlView} from "~/components/FormEditor/YamlView";
import {useDocumentTitle} from "~/hooks/useDocumentTitle";
import {useTranslate} from "~/hooks/useTranslate";
import {useUploadConfigVersionMutation} from "~/store/api/configApi";
import {useGetCurrentUserQuery} from "~/store/api/usersApi";
import {downloadFile} from "~/utils/fileDownload";

export function FormEditorPage() {
    const {t} = useTranslate(["workflow", "common"]);
    const {definition = "", form = ""} = useParams();
    const {data: currentUser, isLoading: isUserLoading} = useGetCurrentUserQuery();
    const {docs, isLoading, error, dirtyPaths, markDirty, reparse, allFiles} = useConfigFiles();
    const [upload, {isLoading: isUploading}] = useUploadConfigVersionMutation();
    const [invalidPaths, setInvalidPaths] = useState(new Set<string>());
    const [previewError, setPreviewError] = useState<string | null>(null);

    useDocumentTitle(t("form_editor.title"));

    if (isUserLoading) {
        return null;
    }
    if (!currentUser?.isSuperAdmin) {
        return <Navigate to="/" replace />;
    }
    if (error) {
        return (
            <Container maxWidth={1280}>
                <Callout type="error">{t("form_editor.load_failed")}</Callout>
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
                    {t("form_editor.back")}
                </BackLink>
                <Callout type="error">{t("form_editor.form_not_found", {path: formPath})}</Callout>
            </Container>
        );
    }

    const pages = readPages(docs, formPath);
    const hasInvalidYaml = [...dirtyPaths].some((path) => invalidPaths.has(path));
    const previewVersion = `edit-${definition.split("/").at(-1)}-${form}`;

    const onPreview = async () => {
        setPreviewError(null);
        const previewTab = window.open("about:blank", "_blank");
        if (previewTab) previewTab.opener = null;

        const result = await upload({version: previewVersion, files: allFiles(docs)});
        if ("error" in result) {
            previewTab?.close();
            const data = (result.error as {data?: unknown}).data;
            setPreviewError(typeof data === "string" ? data : t("form_editor.preview_failed"));
            return;
        }

        const url = `/develop?version=${encodeURIComponent(previewVersion)}`;
        if (previewTab) previewTab.location.href = url;
        else window.open(url, "_blank", "noopener,noreferrer");
    };

    const onDownload = () => {
        const files = allFiles(docs);
        for (const path of dirtyPaths) {
            downloadFile(
                new Blob([files[path]], {type: "text/yaml"}),
                path.split("/").at(-1) ?? path,
            );
        }
    };

    return (
        <Container maxWidth={1280}>
            <BackLink to="/develop" className="mb-4">
                {t("form_editor.back")}
            </BackLink>
            <Card>
                <Heading as="h1" className="mb-4">
                    {form}
                </Heading>
                <div className="mb-4 flex gap-2">
                    <Button
                        intent="primary"
                        onClick={onPreview}
                        isLoading={isUploading}
                        loadingText={t("form_editor.preview")}
                        disabled={hasInvalidYaml}
                    >
                        {t("form_editor.preview")}
                    </Button>
                    <Button intent="secondary" onClick={onDownload} disabled={hasInvalidYaml}>
                        {t("form_editor.download")}
                    </Button>
                </div>
                {previewError && (
                    <Callout type="error" className="mb-4" role="alert">
                        {previewError}
                    </Callout>
                )}
                <Tabs>
                    <TabList>
                        <Tab disabled={hasInvalidYaml}>{t("form_editor.tab_form")}</Tab>
                        <Tab>{t("form_editor.tab_yaml")}</Tab>
                    </TabList>
                    <TabPanels>
                        <TabPanel>
                            <Tabs>
                                <TabList>
                                    {pages.map((page) => (
                                        <Tab key={page.name}>{page.title?.nl || page.name}</Tab>
                                    ))}
                                </TabList>
                                <TabPanels>
                                    {pages.map((page) => (
                                        <TabPanel key={page.name}>
                                            <QuestionList
                                                docs={docs}
                                                formPath={formPath}
                                                pageName={page.name}
                                                onChanged={markDirty}
                                            />
                                        </TabPanel>
                                    ))}
                                </TabPanels>
                            </Tabs>
                        </TabPanel>
                        <TabPanel>
                            <YamlView
                                docs={docs}
                                paths={[...dirtyPaths]}
                                onEdit={(path, text) => reparse(docs, path, text)}
                                onValidityChange={(path, valid) =>
                                    setInvalidPaths((previous) => {
                                        const next = new Set(previous);
                                        if (valid) next.delete(path);
                                        else next.add(path);
                                        return next;
                                    })
                                }
                            />
                        </TabPanel>
                    </TabPanels>
                </Tabs>
            </Card>
        </Container>
    );
}

export default FormEditorPage;
