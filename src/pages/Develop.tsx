import {Navigate, useSearchParams} from "react-router";

import {
    Button,
    Card,
    Container,
    Tab,
    TabList,
    TabPanel,
    TabPanels,
    Tabs,
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
    const creatableDefinitions = definitions.filter((definition) => definition.canCreateInstance);

    const onTabChange = (index: number) => {
        // Preserve every existing param (notably ?version=) and only update ?tab=.
        setSearchParams(
            (prev) => {
                const next = new URLSearchParams(prev);
                next.set("tab", creatableDefinitions[index].name);
                return next;
            },
            {replace: true},
        );
    };

    let definitionsContent;
    if (creatableDefinitions.length === 0) {
        definitionsContent = (
            <Card>
                <p className="text-sm text-grey-700 dark:text-grey-300">
                    {t("develop.no_definitions")}
                </p>
            </Card>
        );
    } else if (creatableDefinitions.length === 1) {
        definitionsContent = (
            <Card>
                <WorkflowInstancesPanel definition={creatableDefinitions[0]} />
            </Card>
        );
    } else {
        const activeName = searchParams.get("tab");
        const activeIndex = Math.max(
            0,
            creatableDefinitions.findIndex((d) => d.name === activeName),
        );
        definitionsContent = (
            <Card>
                <Tabs activeIndex={activeIndex} onTabChange={onTabChange}>
                    <TabList>
                        {creatableDefinitions.map((definition) => (
                            <Tab key={definition.name}>{l(definition.titlePlural)}</Tab>
                        ))}
                    </TabList>
                    <TabPanels>
                        {creatableDefinitions.map((definition) => (
                            <TabPanel key={definition.name}>
                                <WorkflowInstancesPanel definition={definition} />
                            </TabPanel>
                        ))}
                    </TabPanels>
                </Tabs>
            </Card>
        );
    }

    return (
        <Container maxWidth={1280}>
            {header}
            <ConfigVersionCard />
            <FormEditorCard />
            {definitionsContent}
        </Container>
    );
}

export default Develop;
