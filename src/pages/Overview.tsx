import {Fragment, useEffect} from "react";

import {Card, Container, Heading, Icon, Separator, Text} from "@uva-fnwi/datanose-ui";

import {VersionedLink} from "~/components/VersionedLink";
import {useDocumentTitle} from "~/hooks/useDocumentTitle";
import {useTranslate} from "~/hooks/useTranslate";
import {useVersionedNavigate} from "~/hooks/useVersionedNavigate";
import type {WorkflowDefinition} from "~/store/api/types/workflowDefinitions";
import {useGetAccessibleWorkflowDefinitionsQuery} from "~/store/api/workflowDefinitionsApi";

const screenUrlFor = (def: WorkflowDefinition) => `/screens/${def.name}/${def.screens[0]}`;

function CourseRow({to, title, subtitle}: {to: string; title: string; subtitle: string}) {
    return (
        <VersionedLink
            to={to}
            className="group hover:bg-grey-50 flex items-center gap-4 px-5 py-4 transition-colors"
        >
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-grey-100 text-grey-700">
                <Icon name="graduate-cap-solid" size="md" decorative />
            </span>
            <span className="flex min-w-0 flex-col">
                <Text as="span" fontWeight="semibold" className="text-grey-900">
                    {title}
                </Text>
                <Text as="span" size="sm" className="text-grey-600">
                    {subtitle}
                </Text>
            </span>
            <Icon
                name="chevron-right-line"
                size="md"
                decorative
                className="ml-auto shrink-0 text-grey-400 transition-transform group-hover:translate-x-1 group-hover:text-grey-700"
            />
        </VersionedLink>
    );
}

function Overview() {
    const {t, l} = useTranslate("workflow");
    const navigate = useVersionedNavigate();
    useDocumentTitle("Overview");

    const {data: accessibleDefinitions} = useGetAccessibleWorkflowDefinitionsQuery();

    const singleAccessible =
        accessibleDefinitions?.length === 1 ? accessibleDefinitions[0] : undefined;

    useEffect(() => {
        if (singleAccessible) {
            navigate(screenUrlFor(singleAccessible), {replace: true});
        }
    }, [singleAccessible, navigate]);

    if (!accessibleDefinitions) {
        return null;
    }

    if (singleAccessible) {
        // Redirect handled in useEffect.
        return null;
    }

    if (accessibleDefinitions.length === 0) {
        return (
            <Container>
                <p>{t("overview.no_access")}</p>
            </Container>
        );
    }

    return (
        <Container>
            <div className="flex flex-col gap-1">
                <Heading as="h1" size="lg">
                    {t("overview.choose_course_title")}
                </Heading>
                <Text className="text-grey-600">{t("overview.choose_course_subtitle")}</Text>
            </div>
            <Card padding="none" className="mt-6 overflow-hidden">
                {accessibleDefinitions.map((def, index) => (
                    <Fragment key={def.name}>
                        {index > 0 && <Separator />}
                        <CourseRow
                            to={screenUrlFor(def)}
                            title={l(def.title) || def.name}
                            subtitle={l(def.titlePlural) || def.name}
                        />
                    </Fragment>
                ))}
            </Card>
        </Container>
    );
}

export default Overview;
