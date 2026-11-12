import {useOutletContext} from "react-router";

import {Icon} from "@uva-fnwi/datanose-ui";

import type {HomeLayoutContext} from "~/components/HomeLayout";
import {HomeList} from "~/components/HomeList";
import {HomePage} from "~/components/HomePage";
import {WorkflowScreenLink} from "~/components/WorkflowScreenLink";
import {useDocumentTitle} from "~/hooks/useDocumentTitle";
import {useTranslate} from "~/hooks/useTranslate";
import {PersonalContent} from "~/pages/Personal";

function Overview() {
    const {t} = useTranslate("workflow");
    useDocumentTitle("Overview");

    const {definitions} = useOutletContext<HomeLayoutContext>();

    if (!definitions) return null;

    const screens = definitions.flatMap((definition) =>
        definition.screens.map((name) => ({definition, name})),
    );

    return (
        <HomePage
            title={t("overview.choose_course_title")}
            personalContent={<PersonalContent />}
            searchScreens={screens}
        >
            {screens.length === 0 ? (
                <p>{t("overview.no_access")}</p>
            ) : (
                <HomeList>
                    {screens.map(({definition, name}) => {
                        const workflowTypes = [definition.name, definition.inheritsFrom];
                        let icon;
                        if (workflowTypes.includes("Thesis-Base")) {
                            icon = <Icon name="graduate-cap-solid" label={t("overview.thesis")} />;
                        } else if (workflowTypes.includes("Internship-Base")) {
                            icon = <Icon name="suitcase-solid" label={t("overview.internship")} />;
                        }

                        return (
                            <li key={`${definition.name}/${name}`}>
                                <WorkflowScreenLink
                                    definition={definition}
                                    name={name}
                                    icon={icon}
                                />
                            </li>
                        );
                    })}
                </HomeList>
            )}
        </HomePage>
    );
}

export default Overview;
