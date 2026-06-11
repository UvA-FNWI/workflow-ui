import {Navigate, useSearchParams} from "react-router";

import {
    Card,
    Container,
    Heading,
    Tab,
    TabList,
    TabPanel,
    TabPanels,
    Tabs,
} from "@uva-fnwi/datanose-ui";

import {BackLink} from "~/components/BackLink";
import {useDocumentTitle} from "~/hooks/useDocumentTitle";
import {useTranslate} from "~/hooks/useTranslate";
import {WorkflowInstancesPanel} from "~/pages/develop/WorkflowInstancesPanel";
import {useGetCurrentUserQuery} from "~/store/api/usersApi";
import {useGetWorkflowDefinitionsQuery} from "~/store/api/workflowDefinitionsApi";

function Develop() {
    const {t, l} = useTranslate(["workflow", "common"]);
    const {data: currentUser, isLoading: isUserLoading} = useGetCurrentUserQuery();
    const {data: definitions} = useGetWorkflowDefinitionsQuery({includeAll: true});
    const [searchParams, setSearchParams] = useSearchParams();

    useDocumentTitle("Develop");

    // The Develop area is admin-only; wait for the user to load, then bounce non-admins.
    if (isUserLoading) {
        return null;
    }
    if (!currentUser?.isSuperAdmin) {
        return <Navigate to="/" replace />;
    }

    if (!definitions) {
        return null;
    }

    // Only show types the user can actually create here — the page is for creating/iterating on
    // instances, so non-creatable types (e.g. Context) would just be empty, unactionable tabs.
    const creatableDefinitions = definitions.filter((definition) => definition.canCreateInstance);
    const backLink = <BackLink className="mb-4">{t("home")}</BackLink>;

    if (creatableDefinitions.length === 0) {
        return (
            <Container maxWidth={1280}>
                {backLink}
                <Card>
                    <p className="text-sm text-grey-700 dark:text-grey-300">
                        {t("develop.no_definitions")}
                    </p>
                </Card>
            </Container>
        );
    }

    if (creatableDefinitions.length === 1) {
        return (
            <Container maxWidth={1280}>
                {backLink}
                <Card>
                    <WorkflowInstancesPanel definition={creatableDefinitions[0]} />
                </Card>
            </Container>
        );
    }

    const activeName = searchParams.get("tab");
    const activeIndex = Math.max(
        0,
        creatableDefinitions.findIndex((d) => d.name === activeName),
    );

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

    return (
        <Container maxWidth={1280}>
            {backLink}
            <Card>
                <Heading as="h1" className="mb-4">
                    {t("develop.title")}
                </Heading>
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
        </Container>
    );
}

export default Develop;
