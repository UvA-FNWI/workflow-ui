import {type ReactNode, useEffect, useState} from "react";

import {useLocation, useSearchParams} from "react-router";

import {skipToken} from "@reduxjs/toolkit/query";
import {Heading, Icon, SearchInput, Text} from "@uva-fnwi/datanose-ui";

import {HomeList} from "~/components/HomeList";
import {HomeListLink} from "~/components/HomeListLink";
import {useDebounce} from "~/hooks/useDebounce";
import {useTranslate} from "~/hooks/useTranslate";
import {useSearchPeopleQuery} from "~/store/api/usersApi";
import {selectCurrentUser} from "~/store/authSlice";
import {useAppSelector} from "~/store/store";

const minQueryLength = 2;
const maxQueryLength = 200;

function isValidQuery(query: string) {
    return query.length >= minQueryLength && query.length <= maxQueryLength;
}

export function HomePeopleSearch({children}: {children: ReactNode}) {
    const {t} = useTranslate("workflow");
    const {pathname, search} = useLocation();
    const [params, setParams] = useSearchParams();
    const canSearchPeople = useAppSelector(selectCurrentUser)?.canSearchPeople;
    const value = params.get("people") ?? "";
    const query = value.trim();
    const [debouncedQuery, setDebouncedQuery] = useState(query);
    const debounceQuery = useDebounce(() => setDebouncedQuery(query), 500);
    useEffect(() => debounceQuery(), [debounceQuery, query]);

    const searchQuery = query ? debouncedQuery : "";
    const showResults = isValidQuery(searchQuery);
    const {currentData, isFetching, isError} = useSearchPeopleQuery(
        canSearchPeople && showResults ? searchQuery : skipToken,
    );

    if (!canSearchPeople) return children;

    return (
        <>
            <div role="search" className="mb-6 max-w-sm">
                <SearchInput
                    label={t("people_search.label")}
                    placeholder={t("people_search.placeholder")}
                    value={value}
                    maxLength={maxQueryLength}
                    onChange={(nextValue) => {
                        const next = new URLSearchParams(params);
                        if (nextValue) next.set("people", nextValue);
                        else next.delete("people");
                        if (!nextValue.trim()) setDebouncedQuery("");
                        setParams(next, {replace: true, preventScrollReset: true});
                    }}
                />
            </div>
            {searchQuery && !showResults && (
                <Text role="status">{t("people_search.query_length")}</Text>
            )}
            <div hidden={Boolean(searchQuery)}>{children}</div>
            {showResults && (
                <section className="flex flex-col gap-3" aria-label={t("people_search.label")}>
                    {isFetching ? (
                        <Text role="status">{t("people_search.loading")}</Text>
                    ) : isError ? (
                        <Text role="alert">{t("people_search.error")}</Text>
                    ) : currentData && currentData.people.length > 0 ? (
                        <>
                            <Heading as="h2" size="sm" aria-live="polite">
                                {t("people_search.results", {
                                    count: currentData.people.length,
                                    query: searchQuery,
                                })}
                            </Heading>
                            <HomeList>
                                {currentData.people.map((person) => (
                                    <li key={person.id}>
                                        <HomeListLink
                                            to={`/personal/${encodeURIComponent(person.id)}`}
                                            state={{from: {pathname, search}}}
                                            title={person.displayName}
                                            subtitle={[person.email, person.userName]
                                                .filter(Boolean)
                                                .join(" · ")}
                                            icon={
                                                <Icon name="user-line" color="current" decorative />
                                            }
                                            iconClassName="bg-green-100 text-green-900"
                                        />
                                    </li>
                                ))}
                            </HomeList>
                            {currentData.hasMore && (
                                <Text role="status">{t("people_search.refine")}</Text>
                            )}
                        </>
                    ) : (
                        <Text role="status">{t("people_search.empty")}</Text>
                    )}
                </section>
            )}
        </>
    );
}
