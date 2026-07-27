import {useMemo, useState} from "react";

import {type ColumnDef} from "@tanstack/react-table";
import {
    Button,
    Card,
    Container,
    Heading,
    Icon,
    linkClassGenerator,
    Pill,
    SearchInput,
    Skeleton,
    Text,
} from "@uva-fnwi/datanose-ui";

import {DataTable} from "~/components/Table";
import {VersionedLink} from "~/components/VersionedLink";
import {useDocumentTitle} from "~/hooks/useDocumentTitle";
import {useTranslate} from "~/hooks/useTranslate";
import {useVersionedNavigate} from "~/hooks/useVersionedNavigate";
import {useGetPersonalInstancesQuery} from "~/store/api/personalApi";
import type {PersonalInstance} from "~/store/api/types/personal";
import {groupPersonalInstancesByRole} from "~/utils/personalInstances";

export default function Personal() {
    const {data: instances = [], isLoading, isError} = useGetPersonalInstancesQuery();
    const {l, t} = useTranslate("workflow");
    const navigate = useVersionedNavigate();
    const [search, setSearch] = useState("");
    useDocumentTitle(t("personal.title"));

    const roleGroups = useMemo(() => groupPersonalInstancesByRole(instances), [instances]);
    const columns = useMemo<ColumnDef<PersonalInstance>[]>(
        () => [
            {
                id: "student",
                accessorKey: "student",
                header: () => t("personal.columns.student_name"),
                cell: ({getValue}) => getValue<string | null>() || "—",
            },
            {
                id: "title",
                accessorFn: (instance) =>
                    instance.title || l(instance.workflowDefinitionTitle) || instance.id,
                header: () => t("personal.columns.title"),
                cell: ({row}) => (
                    <VersionedLink
                        to={`/instance/${row.original.id}`}
                        className={linkClassGenerator({
                            intent: "primary",
                            underline: true,
                            size: "sm",
                        })}
                    >
                        {row.original.title ||
                            l(row.original.workflowDefinitionTitle) ||
                            row.original.id}
                    </VersionedLink>
                ),
            },
            {
                id: "course",
                accessorKey: "course",
                header: () => t("personal.columns.course"),
                cell: ({getValue}) => getValue<string | null>() || "—",
            },
            {
                id: "employees",
                accessorFn: (instance) => instance.employees.join(", "),
                header: () => t("personal.columns.employees"),
                cell: ({getValue}) => getValue<string>() || "—",
            },
            {
                id: "currentStep",
                accessorFn: (instance) => formatIdentifier(instance.currentStep),
                header: () => t("personal.columns.progress"),
                cell: ({getValue}) => getValue<string>() || "—",
            },
            {
                id: "actions",
                header: () => <span className="sr-only">{t("screens.actions")}</span>,
                enableSorting: false,
                cell: ({row}) => (
                    <div className="flex w-auto justify-end p-0">
                        <Button
                            intent="primary"
                            variant="destructive"
                            size="square"
                            width="none"
                            className="flex items-center justify-center rounded-sm text-white"
                            aria-label={t("personal.open_instance", {
                                title:
                                    row.original.title ||
                                    l(row.original.workflowDefinitionTitle) ||
                                    row.original.id,
                            })}
                            onClick={() => navigate(`/instance/${row.original.id}`)}
                        >
                            <Icon name="visible-line" color="current" />
                        </Button>
                    </div>
                ),
            },
        ],
        [l, navigate, t],
    );

    return (
        <Container maxWidth={1280}>
            <div className="flex flex-col gap-6">
                <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
                    <div className="flex flex-col gap-1">
                        <Heading as="h1" size="lg">
                            {t("personal.title")}
                        </Heading>
                        <Text className="text-grey-600">{t("personal.subtitle")}</Text>
                    </div>
                    {!isLoading && !isError && roleGroups.length > 0 && (
                        <SearchInput
                            value={search}
                            onChange={setSearch}
                            placeholder={t("personal.search_placeholder")}
                            className="w-full md:max-w-sm"
                        />
                    )}
                </div>

                {isLoading && <PersonalLoadingState />}

                {!isLoading && isError && (
                    <Card>
                        <Text className="text-red-700">{t("personal.load_error")}</Text>
                    </Card>
                )}

                {!isLoading && !isError && roleGroups.length === 0 && (
                    <Card>
                        <div className="flex flex-col items-center gap-3 py-10 text-center">
                            <span className="flex h-12 w-12 items-center justify-center rounded-full bg-grey-100 text-grey-600">
                                <Icon name="folder-line" size="lg" decorative />
                            </span>
                            <Heading as="h2" size="sm">
                                {t("personal.empty_title")}
                            </Heading>
                            <Text className="max-w-lg text-grey-600">
                                {t("personal.empty_description")}
                            </Text>
                        </div>
                    </Card>
                )}

                {!isLoading &&
                    !isError &&
                    roleGroups.map(({role, instances: roleInstances}) => (
                        <Card key={role} padding="none" className="overflow-hidden">
                            <div className="flex items-center justify-between gap-4 border-b border-grey-300 px-6 py-4 dark:border-grey-600">
                                <div>
                                    <Text size="sm" className="text-grey-600">
                                        {t("personal.role")}
                                    </Text>
                                    <Heading as="h2" size="sm">
                                        {formatIdentifier(role)}
                                    </Heading>
                                </div>
                                <Pill variant="grey">{roleInstances.length}</Pill>
                            </div>
                            <DataTable
                                data={roleInstances}
                                columns={columns}
                                getRowId={(instance) => instance.id}
                                globalFilter={search}
                            />
                        </Card>
                    ))}
            </div>
        </Container>
    );
}

function PersonalLoadingState() {
    return (
        <>
            {[0, 1].map((item) => (
                <Card key={item}>
                    <Skeleton className="mb-5 h-7 w-40" />
                    <Skeleton className="h-48 w-full" />
                </Card>
            ))}
        </>
    );
}

function formatIdentifier(value: string | null): string {
    if (!value) {
        return "";
    }

    return value
        .replace(/[-_]+/g, " ")
        .replace(/([a-z\d])([A-Z])/g, "$1 $2")
        .replace(/^./, (character) => character.toUpperCase());
}
