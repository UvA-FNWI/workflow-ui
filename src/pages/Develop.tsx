import {type Key} from "react";

import {Navigate, useSearchParams} from "react-router";

import {
    Button,
    Card,
    ComboBox,
    ComboBoxItem,
    Container,
    InputLabel,
    Text,
} from "@uva-fnwi/datanose-ui";

import {PageHeader} from "~/components/PageHeader";
import {useDocumentTitle} from "~/hooks/useDocumentTitle";
import {useTranslate} from "~/hooks/useTranslate";
import {useVersionedNavigate} from "~/hooks/useVersionedNavigate";
import {ConfigVersionCard} from "~/pages/develop/ConfigVersionCard";
import {FormEditorCard} from "~/pages/develop/FormEditorCard";
import {WorkflowInstancesPanel} from "~/pages/develop/WorkflowInstancesPanel";
import {useGetCurrentUserQuery} from "~/store/api/usersApi";
import {useGetWorkflowDefinitionsQuery} from "~/store/api/workflowDefinitionsApi";

function Develop() {
    const {t, l} = useTranslate(["workflow", "common"]);
    const {data: currentUser, isLoading: isUserLoading} = useGetCurrentUserQuery();
    const {data: definitions, isLoading: isDefinitionsLoading} = useGetWorkflowDefinitionsQuery({
        includeAll: true,
    });
    const [searchParams, setSearchParams] = useSearchParams();
    const navigate = useVersionedNavigate();

    useDocumentTitle("Develop");

    // The Develop area is admin-only; wait for the user to load, then bounce non-admins.
    if (!isUserLoading && !currentUser?.isSuperAdmin) {
        return <Navigate to="/" replace />;
    }

    const header = (
        <PageHeader
            title={t("develop.title")}
            backLabel={t("home")}
            isLoading={isUserLoading || isDefinitionsLoading}
            actions={
                <Button intent="secondary" onClick={() => navigate("/develop/migrations")}>
                    {t("migrations.title")}
                </Button>
            }
        />
    );

    if (isUserLoading || isDefinitionsLoading) {
        return <Container maxWidth={1280}>{header}</Container>;
    }

    if (!definitions) {
        return null;
    }

    // Only show types the user can actually create here — the page is for creating/iterating on
    // instances, so non-creatable types (e.g. Context) would just be empty, unactionable tabs.
    const creatableDefinitions = definitions
        .filter((definition) => definition.canCreateInstance)
        .sort((a, b) => (l(a.title) ?? "").localeCompare(l(b.title) ?? ""));

    const selectedDefinitionId = searchParams.get("definition");
    const selectedDefinition = creatableDefinitions.find(
        (definition) => definition.name === selectedDefinitionId,
    );

    const onDefinitionChange = (key: Key | null) => {
        // Preserve every existing param (notably ?version=) and only update ?tab=.
        setSearchParams(
            (prev) => {
                const next = new URLSearchParams(prev);
                if (key === null) {
                    next.delete("definition");
                } else {
                    next.set("definition", String(key));
                }
                return next;
            },
            {replace: true},
        );
    };

    return (
        <Container maxWidth={1280}>
            {header}
            <ConfigVersionCard />
            <FormEditorCard />
            <Card>
                {creatableDefinitions.length === 0 ? (
                    <Text className="italic">{t("develop.no_definitions")}</Text>
                ) : (
                    <div className="flex flex-col gap-4 pt-4 pb-6">
                        <div>
                            <InputLabel>{t("develop.select_definition")}</InputLabel>
                            <ComboBox
                                value={selectedDefinition ? selectedDefinitionId : null}
                                onChange={onDefinitionChange}
                                placeholder={t("select")}
                                noResults={t("search_and_select.no_results")}
                            >
                                {creatableDefinitions.map((definition) => (
                                    <ComboBoxItem
                                        key={definition.name}
                                        textValue={`${l(definition.title)} (${l(definition.titlePlural)})`}
                                    >
                                        {`${l(definition.title)} (${l(definition.titlePlural)})`}
                                    </ComboBoxItem>
                                ))}
                            </ComboBox>
                        </div>
                        {selectedDefinition ? (
                            <WorkflowInstancesPanel definition={selectedDefinition} />
                        ) : (
                            <Text className="italic">{t("develop.no_definition_selected")}</Text>
                        )}
                    </div>
                )}
            </Card>
        </Container>
    );
}

export default Develop;
