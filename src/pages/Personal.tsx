import {useMemo, useState} from "react";

import {type ColumnDef} from "@tanstack/react-table";
import {
    Button,
    Card,
    Container,
    Disclosure,
    Heading,
    Icon,
    SearchInput,
    Skeleton,
    Text,
} from "@uva-fnwi/datanose-ui";

import {PageHeader} from "~/components/PageHeader";
import {DataTable, TableLinkCell, TableProgressCell, TableTextCell} from "~/components/Table";
import {useDocumentTitle} from "~/hooks/useDocumentTitle";
import {useTranslate} from "~/hooks/useTranslate";
import {useVersionedNavigate} from "~/hooks/useVersionedNavigate";
import {useGetPersonalInstancesQuery} from "~/store/api/personalApi";
import type {PersonalInstance} from "~/store/api/types/personal";
import {
    groupPersonalInstancesByRole,
    partitionPersonalInstancesByCompletion,
    type PersonalRoleGroup,
} from "~/utils/personalInstances";
import {getComparableTableCellValue} from "~/utils/tableCellValues";

const noInstances: PersonalInstance[] = [];

export default function Personal() {
    const {data, isLoading, isError} = useGetPersonalInstancesQuery();
    const instances = data?.instances ?? noInstances;
    const {i18n, l, t} = useTranslate("personal");
    const {t: workflowT} = useTranslate("workflow");
    const navigate = useVersionedNavigate();
    const [activeSearch, setActiveSearch] = useState("");
    const [completedSearch, setCompletedSearch] = useState("");
    useDocumentTitle(t("title"));

    const {activeRoleGroups, completedRoleGroups} = useMemo(() => {
        const {active, completed} = partitionPersonalInstancesByCompletion(instances);
        return {
            activeRoleGroups: groupPersonalInstancesByRole(active, data?.roles ?? []),
            completedRoleGroups: groupPersonalInstancesByRole(completed, data?.roles ?? []),
        };
    }, [data?.roles, instances]);
    const hasRoleGroups = activeRoleGroups.length > 0 || completedRoleGroups.length > 0;
    const columns = useMemo<ColumnDef<PersonalInstance>[]>(
        () => [
            {
                id: "student",
                size: 180,
                accessorFn: (instance) =>
                    getComparableTableCellValue(instance.student, "String", i18n.language),
                header: () => t("columns.student_name"),
                cell: ({row}) => (
                    <TableLinkCell to={`/instance/${row.original.id}`}>
                        {row.original.student || "—"}
                    </TableLinkCell>
                ),
                enableSorting: true,
            },
            {
                id: "title",
                size: 220,
                accessorFn: (instance) =>
                    getComparableTableCellValue(
                        instance.title || l(instance.workflowDefinitionTitle) || instance.id,
                        "String",
                        i18n.language,
                    ),
                header: () => t("columns.title"),
                cell: ({row}) => (
                    <TableTextCell>
                        {row.original.title ||
                            l(row.original.workflowDefinitionTitle) ||
                            row.original.id}
                    </TableTextCell>
                ),
                enableSorting: true,
            },
            {
                id: "course",
                size: 170,
                accessorFn: (instance) =>
                    getComparableTableCellValue(instance.course, "String", i18n.language),
                header: () => t("columns.course"),
                cell: ({row}) => <TableTextCell>{row.original.course || "—"}</TableTextCell>,
                enableSorting: true,
            },
            {
                id: "employees",
                size: 200,
                accessorFn: (instance) =>
                    getComparableTableCellValue(
                        instance.employees.join(", "),
                        "String",
                        i18n.language,
                    ),
                header: () => t("columns.employees"),
                cell: ({row}) => (
                    <TableTextCell>{row.original.employees.join(", ") || "—"}</TableTextCell>
                ),
                enableSorting: true,
            },
            {
                id: "progress",
                size: 220,
                accessorFn: (instance) =>
                    getComparableTableCellValue(instance.progress, "Object", i18n.language),
                header: () => t("columns.progress"),
                cell: ({row}) => <TableProgressCell progress={row.original.progress} />,
                enableSorting: true,
            },
            {
                id: "actions",
                size: 64,
                header: () => <span className="sr-only">{workflowT("screens.actions")}</span>,
                enableSorting: false,
                cell: ({row}) => (
                    <div className="flex w-auto justify-end p-0">
                        <Button
                            intent="primary"
                            variant="destructive"
                            size="square"
                            width="none"
                            className="flex items-center justify-center rounded-sm text-white"
                            aria-label={t("open_instance", {
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
        [i18n.language, l, navigate, t, workflowT],
    );

    return (
        <Container maxWidth={1280}>
            <PageHeader title={t("title")} backLabel={workflowT("home")} />
            <div className="flex flex-col gap-6">
                {isLoading && <PersonalLoadingState />}

                {!isLoading && isError && (
                    <Card>
                        <Text className="text-red-700">{t("load_error")}</Text>
                    </Card>
                )}

                {!isLoading && !isError && !hasRoleGroups && (
                    <Card>
                        <div className="flex flex-col items-center gap-3 py-10 text-center">
                            <span className="flex h-12 w-12 items-center justify-center rounded-full bg-grey-100 text-grey-600">
                                <Icon name="folder-line" size="lg" decorative />
                            </span>
                            <Heading as="h2" size="sm">
                                {t("empty_title")}
                            </Heading>
                            <Text className="max-w-lg text-grey-600">{t("empty_description")}</Text>
                        </div>
                    </Card>
                )}

                {!isLoading && !isError && hasRoleGroups && (
                    <>
                        <Disclosure defaultExpanded>
                            <Disclosure.Header>
                                <Heading>{t("active")}</Heading>
                            </Disclosure.Header>
                            <Disclosure.Content>
                                <div className="mb-6 flex justify-end pt-4">
                                    <SearchInput
                                        value={activeSearch}
                                        onChange={setActiveSearch}
                                        placeholder={t("search_placeholder")}
                                        className="w-full sm:w-96"
                                    />
                                </div>
                                <PersonalRoleTables
                                    roleGroups={activeRoleGroups}
                                    columns={columns}
                                    search={activeSearch}
                                />
                            </Disclosure.Content>
                        </Disclosure>
                        <Disclosure>
                            <Disclosure.Header>
                                <Heading>{t("completed")}</Heading>
                            </Disclosure.Header>
                            <Disclosure.Content>
                                <div className="mb-6 flex justify-end pt-4">
                                    <SearchInput
                                        value={completedSearch}
                                        onChange={setCompletedSearch}
                                        placeholder={t("search_placeholder")}
                                        className="w-full sm:w-96"
                                    />
                                </div>
                                <PersonalRoleTables
                                    roleGroups={completedRoleGroups}
                                    columns={columns}
                                    search={completedSearch}
                                />
                            </Disclosure.Content>
                        </Disclosure>
                    </>
                )}
            </div>
        </Container>
    );
}

function PersonalRoleTables({
    roleGroups,
    columns,
    search,
}: {
    roleGroups: PersonalRoleGroup[];
    columns: ColumnDef<PersonalInstance>[];
    search: string;
}) {
    const {l, t} = useTranslate("personal");

    return (
        <div className="flex flex-col gap-6">
            {roleGroups.map(({role, instances: roleInstances}) => (
                <section key={role.name} className="overflow-hidden">
                    <Heading as="h3" size="sm" className="pb-4">
                        {t("role_title", {
                            role: (
                                l(role.title) || formatIdentifier(role.name)
                            ).toLocaleLowerCase(),
                        })}
                    </Heading>
                    <DataTable
                        data={roleInstances}
                        columns={columns}
                        getRowId={(instance) => instance.id}
                        globalFilter={search}
                    />
                </section>
            ))}
        </div>
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
