import {useState} from "react";

import {Link, useParams} from "react-router";

import {Card, Container, Heading, Icon, SearchInput, Skeleton} from "@uva-fnwi/datanose-ui";

import {JobsTable} from "~/components/JobsTable";
import {useTranslate} from "~/hooks/useTranslate";
import {jobsEndpoints} from "~/store/api/jobsApi";

function InstanceJobs() {
    const {id} = useParams<{id: string}>();
    const {t} = useTranslate(["workflow", "common"]);
    const [search, setSearch] = useState("");

    const {
        data: jobs,
        isLoading,
        isError,
    } = jobsEndpoints.getJobs.useQuery(id ?? "", {
        skip: !id,
    });

    if (!id) {
        return <div>{t("jobs.error")}</div>;
    }

    if (isError) {
        return <div>{t("jobs.error")}</div>;
    }

    return (
        <Container maxWidth={1280}>
            <div className="mb-8 flex flex-col gap-2">
                <Link to={`/instance/${id}`} className="text-sm text-red-brand hover:opacity-80">
                    <Icon name="arrow-left-line" size="xs" className="mr-1" color="current" />
                    {t("jobs.backToInstance")}
                </Link>
                <Heading as="h1" size="lg">
                    {t("jobs.title")}
                </Heading>
            </div>
            <Card>
                <div className="mb-4 flex w-full justify-end">
                    <SearchInput
                        value={search}
                        onChange={setSearch}
                        placeholder={t("search_placeholder", {ns: "common"})}
                        className="w-fit max-w-sm"
                    />
                </div>
                {isLoading ? (
                    <Skeleton className="h-64 w-full" />
                ) : (
                    <JobsTable jobs={jobs ?? []} globalFilter={search} />
                )}
            </Card>
        </Container>
    );
}

export default InstanceJobs;
