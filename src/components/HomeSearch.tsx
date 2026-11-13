import {type ReactNode, useEffect, useState} from "react";

import {useLocation, useSearchParams} from "react-router";

import {skipToken} from "@reduxjs/toolkit/query";
import {Heading, Icon, SearchInput, Text} from "@uva-fnwi/datanose-ui";

import {HomeList} from "~/components/HomeList";
import {HomeListLink} from "~/components/HomeListLink";
import {type WorkflowScreen, WorkflowScreenLink} from "~/components/WorkflowScreenLink";
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

export function HomeSearch({
    children,
    renderHeader,
    workflowScreens,
}: {
    children: ReactNode;
    renderHeader: (searching: boolean) => ReactNode;
    workflowScreens: WorkflowScreen[];
}) {
    const {t} = useTranslate("workflow");
    const {pathname, search} = useLocation();
    const [params, setParams] = useSearchParams();
    const canSearchPeople = useAppSelector(selectCurrentUser)?.canSearchPeople;
    const value = params.get("search") ?? "";
    const query = value.trim();
    const [debouncedQuery, setDebouncedQuery] = useState(query);
    const debounceQuery = useDebounce(() => setDebouncedQuery(query), 500);
    useEffect(() => debounceQuery(), [debounceQuery, query]);

    const searchQuery = query ? debouncedQuery : "";
    const showResults = isValidQuery(searchQuery);
    const queryArg = canSearchPeople && showResults ? searchQuery : skipToken;
    const {currentData, isFetching, isError} = useSearchPeopleQuery(queryArg);

    if (!canSearchPeople) {
        return (
            <>
                {renderHeader(false)}
                {children}
            </>
        );
    }

    const term = searchQuery.toLowerCase();
    const workflows = showResults
        ? workflowScreens.filter(({definition, name}) =>
              [
                  name,
                  definition.name,
                  definition.title?.en,
                  definition.title?.nl,
                  definition.titlePlural.en,
                  definition.titlePlural.nl,
              ].some((label) => label?.toLowerCase().includes(term)),
          )
        : [];
    const people = currentData?.people ?? [];
    const count = people.length + workflows.length;

    return (
        <>
            {renderHeader(Boolean(searchQuery))}
            <div role="search" className="mb-6 max-w-sm">
                <SearchInput
                    aria-label={t("home_search.label")}
                    placeholder={t("home_search.placeholder")}
                    value={value}
                    maxLength={maxQueryLength}
                    onChange={(nextValue) => {
                        const next = new URLSearchParams(params);
                        if (nextValue) next.set("search", nextValue);
                        else next.delete("search");
                        if (!nextValue.trim()) setDebouncedQuery("");
                        setParams(next, {replace: true, preventScrollReset: true});
                    }}
                />
            </div>
            {searchQuery && !showResults && (
                <Text role="status">{t("home_search.query_length")}</Text>
            )}
            <div hidden={Boolean(searchQuery)}>{children}</div>
            {showResults && (
                <section className="flex flex-col gap-3" aria-label={t("home_search.label")}>
                    {count > 0 && (
                        <>
                            <Heading as="h2" size="sm" aria-live="polite">
                                {t("home_search.results", {
                                    count,
                                    query: searchQuery,
                                })}
                            </Heading>
                            {workflows.length > 0 && (
                                <HomeList label={t("home_search.workflows")}>
                                    {workflows.map(({definition, name}) => (
                                        <li key={`${definition.name}/${name}`}>
                                            <WorkflowScreenLink
                                                definition={definition}
                                                name={name}
                                            />
                                        </li>
                                    ))}
                                </HomeList>
                            )}
                            {people.length > 0 && (
                                <div className="flex flex-col gap-2">
                                    <HomeList label={t("home_search.people")}>
                                        {people.map((person) => (
                                            <li key={person.id}>
                                                <HomeListLink
                                                    to={`/personal/${encodeURIComponent(person.id)}`}
                                                    state={{from: {pathname, search}}}
                                                    title={person.displayName}
                                                    subtitle={[person.email, person.userName]
                                                        .filter(Boolean)
                                                        .join(" · ")}
                                                    icon={
                                                        <Icon
                                                            name="user-line"
                                                            color="current"
                                                            decorative
                                                        />
                                                    }
                                                    iconClassName="bg-green-100 text-black"
                                                />
                                            </li>
                                        ))}
                                    </HomeList>
                                    {currentData?.hasMore && (
                                        <Text role="status">{t("home_search.refine")}</Text>
                                    )}
                                </div>
                            )}
                        </>
                    )}
                    {isFetching && <Text role="status">{t("home_search.loading")}</Text>}
                    {isError && <Text role="alert">{t("home_search.error")}</Text>}
                    {!isFetching && !isError && count === 0 && (
                        <Text role="status">{t("home_search.empty")}</Text>
                    )}
                </section>
            )}
        </>
    );
}
