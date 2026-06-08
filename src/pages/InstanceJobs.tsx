import {useState} from "react";

import {Link, Navigate, useParams} from "react-router";

import {Card, Container, Heading, Icon, SearchInput, Skeleton} from "@uva-fnwi/datanose-ui";

import {JobsTable} from "~/components/JobsTable";
import {useJobTranslations} from "~/hooks/useJobTranslations";
import {useTranslate} from "~/hooks/useTranslate";
import {instancesEndpoints} from "~/store/api/instancesApi";
import {jobsEndpoints} from "~/store/api/jobsApi";
import {getLocalStringField} from "~/utils/fieldUtils";

function InstanceJobs() {
    const {id} = useParams<{id: string}>();
    const {t, l} = useTranslate(["workflow", "common"]);
    const {page} = useJobTranslations();
    const [search, setSearch] = useState("");

    const {data: instance, isLoading: isLoadingInstance} = instancesEndpoints.getInstance.useQuery(
        id ?? "",
        {
            skip: !id,
        },
    );

    const {
        data: jobs,
        isLoading,
        isError,
        refetch: refetchJobs,
    } = jobsEndpoints.getJobs.useQuery(id ?? "", {
        skip: !id,
    });

    if (!id) {
        return <div>{page.error}</div>;
    }

    if (isError) {
        return <div>{page.error}</div>;
    }

    if (!isLoadingInstance && instance && !instance.canUseAdminTools) {
        return <Navigate to={`/instance/${id}`} replace />;
    }

    const courseName = getLocalStringField(instance?.fields, "Course.Name");
    const displayTitle =
        (typeof courseName === "string" ? courseName : l(courseName)) ||
        t("instance.workflowInstance", {ns: "workflow"});

    return (
        <Container maxWidth={1280}>
            <div className="mb-8 flex flex-col gap-2">
                <Link to={`/instance/${id}`} className="text-sm text-red-brand hover:opacity-80">
                    <Icon name="arrow-left-line" size="xs" className="mr-1" color="current" />
                    {page.backToInstance}
                </Link>
                <Heading as="h1" size="lg">
                    {displayTitle} | {page.title}
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
                    <JobsTable
                        jobs={jobs ?? []}
                        instanceId={id}
                        globalFilter={search}
                        refetch={refetchJobs}
                    />
                )}
            </Card>
        </Container>
    );
}

export default InstanceJobs;
