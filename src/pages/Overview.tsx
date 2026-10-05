import {Fragment} from "react";

import {Card, Icon, Separator, Text} from "@uva-fnwi/datanose-ui";

import {HomePage} from "~/components/HomePage";
import {VersionedLink} from "~/components/VersionedLink";
import {useDocumentTitle} from "~/hooks/useDocumentTitle";
import {useTranslate} from "~/hooks/useTranslate";
import {PersonalContent} from "~/pages/Personal";
import {useGetAccessibleWorkflowDefinitionsQuery} from "~/store/api/workflowDefinitionsApi";

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
    useDocumentTitle("Overview");

    const {data: accessibleDefinitions} = useGetAccessibleWorkflowDefinitionsQuery();

    if (!accessibleDefinitions) return null;

    const screens = accessibleDefinitions.flatMap((definition) =>
        definition.screens.map((name) => ({definition, name})),
    );

    return (
        <HomePage title={t("overview.choose_course_title")} personalContent={<PersonalContent />}>
            {screens.length === 0 ? (
                <p>{t("overview.no_access")}</p>
            ) : (
                <Card padding="none" className="overflow-hidden">
                    {screens.map(({definition: def, name}, index) => (
                        <Fragment key={`${def.name}/${name}`}>
                            {index > 0 && <Separator />}
                            <CourseRow
                                to={`/screens/${def.name}/${name}`}
                                title={l(def.title) || def.name}
                                subtitle={
                                    def.screens.length > 1 ? name : l(def.titlePlural) || def.name
                                }
                            />
                        </Fragment>
                    ))}
                </Card>
            )}
        </HomePage>
    );
}

export default Overview;
