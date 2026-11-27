import {Fragment, useEffect, useMemo} from "react";

import {Card, Icon, SearchInput, Separator, Text} from "@uva-fnwi/datanose-ui";

import {HomeSearchResults} from "~/components/Home/HomeSearchResults";
import {HomePage} from "~/components/HomePage";
import {VersionedLink} from "~/components/VersionedLink";
import {useDocumentTitle} from "~/hooks/useDocumentTitle";
import {useHomeSearch} from "~/hooks/useHomeSearch";
import {useOverviewCopy} from "~/hooks/useOverviewCopy";
import {useTranslate} from "~/hooks/useTranslate";
import {useVersionedNavigate} from "~/hooks/useVersionedNavigate";
import {PersonalContent} from "~/pages/Personal";
import {useGetSettingsQuery} from "~/store/api/settingsApi";
import {useGetAccessibleWorkflowDefinitionsQuery} from "~/store/api/workflowDefinitionsApi";
import {
    buildOverviewEntries,
    buildSearchableScreens,
    overviewScreenUrl,
} from "~/utils/overviewEntries";

const minQueryLength = 2;
const maxQueryLength = 200;

function OverviewEntryRow({
    to,
    title,
    subtitle,
    iconName,
}: {
    to: string;
    title: string;
    subtitle: string;
    iconName: string;
}) {
    return (
        <VersionedLink
            to={to}
            className="group hover:bg-grey-50 flex items-center gap-4 px-5 py-4 transition-colors"
        >
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-grey-100 text-grey-700">
                <Icon name={iconName} size="md" decorative />
            </span>
            <span className="flex min-w-0 flex-col">
                <Text as="span" fontWeight="semibold" className="text-grey-900">
                    {title}
                </Text>
                {subtitle ? (
                    <Text as="span" size="sm" className="text-grey-600">
                        {subtitle}
                    </Text>
                ) : null}
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
    const {l, t} = useTranslate("workflow");
    const {data: settings} = useGetSettingsQuery();
    const copy = useOverviewCopy(settings?.ui?.overview);
    const navigate = useVersionedNavigate();
    const {input, query, setInput} = useHomeSearch();
    const {data: accessibleDefinitions} = useGetAccessibleWorkflowDefinitionsQuery();

    const overviewEntries = useMemo(
        () => (accessibleDefinitions ? buildOverviewEntries(accessibleDefinitions, l) : undefined),
        [accessibleDefinitions, l],
    );

    const workflowScreens = useMemo(
        () => (accessibleDefinitions ? buildSearchableScreens(accessibleDefinitions) : []),
        [accessibleDefinitions],
    );

    const canSearch = workflowScreens.length > 0;
    const searching = canSearch && Boolean(query);
    useDocumentTitle(searching ? t("home_search.title") : copy.pageTitle);

    const isQueryValid = query.length >= minQueryLength && query.length <= maxQueryLength;
    const singleAccessible =
        !searching && overviewEntries?.length === 1 ? overviewEntries[0] : undefined;

    useEffect(() => {
        if (singleAccessible) {
            navigate(
                overviewScreenUrl(singleAccessible.workflowDefinition, singleAccessible.screenName),
                {replace: true},
            );
        }
    }, [singleAccessible, navigate]);

    const searchInput = canSearch ? (
        <div role="search" className="mb-6 max-w-sm">
            <SearchInput
                aria-label={t("home_search.label")}
                placeholder={t("home_search.placeholder")}
                value={input}
                maxLength={maxQueryLength}
                onChange={setInput}
            />
        </div>
    ) : undefined;

    const searchFeedback = isQueryValid ? (
        <HomeSearchResults query={query} workflowScreens={workflowScreens} />
    ) : (
        <Text role="status">{t("home_search.query_length")}</Text>
    );

    const pageTitle = searching ? t("home_search.title") : copy.title;

    if (!overviewEntries) {
        return (
            <HomePage title={copy.title} personalContent={<PersonalContent />} isLoading>
                {null}
            </HomePage>
        );
    }

    if (singleAccessible) {
        return null;
    }

    return (
        <HomePage
            title={pageTitle}
            description={!searching ? copy.subtitle : undefined}
            toolbar={!singleAccessible ? searchInput : undefined}
            alternateContent={searching ? searchFeedback : undefined}
            personalContent={<PersonalContent />}
        >
            {overviewEntries.length === 0 ? (
                <p>{copy.noAccess}</p>
            ) : (
                <>
                    <Card padding="none" className="overflow-hidden">
                        {overviewEntries.map((entry, index) => (
                            <Fragment key={entry.key}>
                                {index > 0 && <Separator />}
                                <OverviewEntryRow
                                    to={overviewScreenUrl(
                                        entry.workflowDefinition,
                                        entry.screenName,
                                    )}
                                    title={entry.title}
                                    subtitle={entry.subtitle}
                                    iconName={entry.iconName}
                                />
                            </Fragment>
                        ))}
                    </Card>
                </>
            )}
        </HomePage>
    );
}

export default Overview;
