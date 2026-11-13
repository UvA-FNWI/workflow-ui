import {useLocation} from "react-router";

import {Heading, Icon, Text} from "@uva-fnwi/datanose-ui";

import {HomeList} from "~/components/HomeList";
import {HomeListLink} from "~/components/HomeListLink";
import {type WorkflowScreen, WorkflowScreenLink} from "~/components/WorkflowScreenLink";
import {useTranslate} from "~/hooks/useTranslate";
import {useSearchPeopleQuery} from "~/store/api/usersApi";

export function HomeSearchResults({
    query,
    workflowScreens,
}: {
    query: string;
    workflowScreens: WorkflowScreen[];
}) {
    const {t} = useTranslate("workflow");
    const {pathname, search} = useLocation();
    const {currentData, isFetching, isError} = useSearchPeopleQuery(query);

    const term = query.toLowerCase();
    const workflows = workflowScreens.filter(({definition, name}) =>
        [
            name,
            definition.name,
            definition.title?.en,
            definition.title?.nl,
            definition.titlePlural.en,
            definition.titlePlural.nl,
        ].some((label) => label?.toLowerCase().includes(term)),
    );
    const people = currentData?.people ?? [];
    const count = people.length + workflows.length;

    return (
        <section className="flex flex-col gap-3" aria-label={t("home_search.label")}>
            {count > 0 && (
                <>
                    <Heading as="h2" size="sm" aria-live="polite">
                        {t("home_search.results", {
                            count,
                            query,
                        })}
                    </Heading>
                    {workflows.length > 0 && (
                        <HomeList label={t("home_search.workflows")}>
                            {workflows.map(({definition, name}) => (
                                <li key={`${definition.name}/${name}`}>
                                    <WorkflowScreenLink definition={definition} name={name} />
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
                                                <Icon name="user-line" color="current" decorative />
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
    );
}
