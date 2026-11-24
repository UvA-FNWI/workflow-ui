import {useOutletContext} from "react-router";

import {SearchInput, Text} from "@uva-fnwi/datanose-ui";

import {HomeList} from "~/components/Home/HomeList";
import {HomeSearchResults} from "~/components/Home/HomeSearchResults";
import {ScreenLink} from "~/components/Home/ScreenLink";
import type {HomeLayoutContext} from "~/components/HomeLayout";
import {HomePage} from "~/components/HomePage";
import {useDocumentTitle} from "~/hooks/useDocumentTitle";
import {useHomeSearch} from "~/hooks/useHomeSearch";
import {useTranslate} from "~/hooks/useTranslate";
import {PersonalContent} from "~/pages/Personal";

const minQueryLength = 2;
const maxQueryLength = 200;

function Overview() {
    const {t} = useTranslate("workflow");
    useDocumentTitle("Overview");

    const {definitions} = useOutletContext<HomeLayoutContext>();
    const {input, query, setInput} = useHomeSearch();

    if (!definitions) return null;

    const screens = definitions.flatMap((definition) =>
        definition.screens.map((name) => ({definition, name})),
    );
    if (screens.length === 0) return null;

    const searching = Boolean(query);
    const isQueryValid = query.length >= minQueryLength && query.length <= maxQueryLength;

    const searchInput = (
        <div role="search" className="mb-6 max-w-sm">
            <SearchInput
                aria-label={t("home_search.label")}
                placeholder={t("home_search.placeholder")}
                value={input}
                maxLength={maxQueryLength}
                onChange={setInput}
            />
        </div>
    );
    const searchFeedback = isQueryValid ? (
        <HomeSearchResults query={query} workflowScreens={screens} />
    ) : (
        <Text role="status">{t("home_search.query_length")}</Text>
    );

    return (
        <HomePage
            title={searching ? t("home_search.title") : t("overview.choose_course_title")}
            toolbar={searchInput}
            alternateContent={searching ? searchFeedback : undefined}
            personalContent={<PersonalContent />}
        >
            <HomeList>
                {screens.map(({definition, name}) => (
                    <li key={`${definition.name}/${name}`}>
                        <ScreenLink definition={definition} name={name} />
                    </li>
                ))}
            </HomeList>
        </HomePage>
    );
}

export default Overview;
