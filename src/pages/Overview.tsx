import {useEffect, useState} from "react";

import {useOutletContext, useSearchParams} from "react-router";

import {SearchInput, Text} from "@uva-fnwi/datanose-ui";

import type {HomeLayoutContext} from "~/components/HomeLayout";
import {HomeList} from "~/components/HomeList";
import {HomePage, HomeRoleTabs} from "~/components/HomePage";
import {HomeSearchResults} from "~/components/HomeSearchResults";
import {WorkflowScreenLink} from "~/components/WorkflowScreenLink";
import {useDebounce} from "~/hooks/useDebounce";
import {useDocumentTitle} from "~/hooks/useDocumentTitle";
import {useTranslate} from "~/hooks/useTranslate";
import {PersonalContent} from "~/pages/Personal";
import {selectCurrentUser} from "~/store/authSlice";
import {useAppSelector} from "~/store/store";

const minQueryLength = 2;
const maxQueryLength = 200;

function Overview() {
    const {t} = useTranslate("workflow");
    useDocumentTitle("Overview");

    const {definitions} = useOutletContext<HomeLayoutContext>();
    const [params, setParams] = useSearchParams();
    const canSearchPeople = useAppSelector(selectCurrentUser)?.canSearchPeople;
    const input = params.get("search") ?? "";
    const trimmedInput = input.trim();
    const [query, setQuery] = useState(trimmedInput);
    const updateQuery = useDebounce(() => setQuery(trimmedInput), 500);
    useEffect(() => updateQuery(), [trimmedInput, updateQuery]);

    const searching = Boolean(canSearchPeople && trimmedInput && query);
    const showResults =
        searching && query.length >= minQueryLength && query.length <= maxQueryLength;

    if (!definitions) return null;

    const screens = definitions.flatMap((definition) =>
        definition.screens.map((name) => ({definition, name})),
    );

    function handleSearchChange(value: string) {
        if (!value.trim()) setQuery("");

        const nextParams = new URLSearchParams(params);
        if (value) nextParams.set("search", value);
        else nextParams.delete("search");
        setParams(nextParams, {replace: true, preventScrollReset: true});
    }

    return (
        <HomePage title={t(searching ? "home_search.title" : "overview.choose_course_title")}>
            {canSearchPeople && (
                <div role="search" className="mb-6 max-w-sm">
                    <SearchInput
                        aria-label={t("home_search.label")}
                        placeholder={t("home_search.placeholder")}
                        value={input}
                        maxLength={maxQueryLength}
                        onChange={handleSearchChange}
                    />
                </div>
            )}
            {searching && !showResults && (
                <Text role="status">{t("home_search.query_length")}</Text>
            )}
            <div hidden={searching}>
                <HomeRoleTabs personalContent={<PersonalContent />}>
                    {screens.length === 0 ? (
                        <p>{t("overview.no_access")}</p>
                    ) : (
                        <HomeList>
                            {screens.map(({definition, name}) => (
                                <li key={`${definition.name}/${name}`}>
                                    <WorkflowScreenLink definition={definition} name={name} />
                                </li>
                            ))}
                        </HomeList>
                    )}
                </HomeRoleTabs>
            </div>
            {showResults && <HomeSearchResults query={query} workflowScreens={screens} />}
        </HomePage>
    );
}

export default Overview;
