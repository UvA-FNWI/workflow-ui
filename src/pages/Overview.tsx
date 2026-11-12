import {useOutletContext} from "react-router";

import {Icon} from "@uva-fnwi/datanose-ui";

import type {HomeLayoutContext} from "~/components/HomeLayout";
import {HomeList} from "~/components/HomeList";
import {HomeListLink} from "~/components/HomeListLink";
import {HomePage} from "~/components/HomePage";
import {useDocumentTitle} from "~/hooks/useDocumentTitle";
import {useTranslate} from "~/hooks/useTranslate";
import {PersonalContent} from "~/pages/Personal";

function Overview() {
    const {t, l} = useTranslate("workflow");
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
            showPeopleSearch
        >
            {screens.length === 0 ? (
                <p>{t("overview.no_access")}</p>
            ) : (
                <HomeList>
                    {screens.map(({definition: def, name}) => (
                        <li key={`${def.name}/${name}`}>
                            <HomeListLink
                                to={`/screens/${def.name}/${name}`}
                                title={l(def.title) || def.name}
                                subtitle={
                                    def.screens.length > 1 ? name : l(def.titlePlural) || def.name
                                }
                                icon={<Icon name="graduate-cap-solid" decorative />}
                                iconClassName="bg-grey-100 text-grey-700"
                            />
                        </li>
                    ))}
                </HomeList>
            )}
        </HomePage>
    );
}

export default Overview;
