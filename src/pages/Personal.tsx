import {useMemo} from "react";

import {type ColumnDef} from "@tanstack/react-table";
import {Button, Card, Icon, Skeleton, Text} from "@uva-fnwi/datanose-ui";

import {HomePage} from "~/components/HomePage";
import {PersonalDisclosure} from "~/components/PersonalDisclosure";
import {TableLinkCell, TableProgressCell, TableTextCell} from "~/components/Table";
import {useDocumentTitle} from "~/hooks/useDocumentTitle";
import {useTranslate} from "~/hooks/useTranslate";
import {useVersionedNavigate} from "~/hooks/useVersionedNavigate";
import {useGetPersonalInstancesQuery} from "~/store/api/personalApi";
import type {PersonalInstance} from "~/store/api/types/personal";
import {
    groupPersonalInstancesByRole,
    partitionPersonalInstancesByCompletion,
} from "~/utils/personalInstances";
import {getComparableTableCellValue} from "~/utils/tableCellValues";

const noInstances: PersonalInstance[] = [];

export default function Personal() {
    const {t} = useTranslate("screens");
    useDocumentTitle(t("title"));

    return (
        <HomePage title={t("title")}>
            <PersonalContent />
        </HomePage>
    );
}

export function PersonalContent({workflowDefinition}: {workflowDefinition?: string}) {
    const {data, isLoading, isError} = useGetPersonalInstancesQuery();
    const instances = data?.instances ?? noInstances;
    const {i18n, l, t} = useTranslate("screens");
    const {t: workflowT} = useTranslate("workflow");
    const navigate = useVersionedNavigate();
    const workflowTitle = workflowDefinition
        ? l(
              instances.find((instance) => instance.workflowDefinition === workflowDefinition)
                  ?.workflowDefinitionTitle,
          )
        : undefined;
    const titleSuffix = workflowTitle ? ` (${workflowTitle})` : "";

    const {activeRoleGroups, completedRoleGroups} = useMemo(() => {
        const workflowInstances = workflowDefinition
            ? instances.filter((instance) => instance.workflowDefinition === workflowDefinition)
            : instances;
        const {active, completed} = partitionPersonalInstancesByCompletion(workflowInstances);
        return {
            activeRoleGroups: groupPersonalInstancesByRole(active, data?.roles ?? []),
            completedRoleGroups: groupPersonalInstancesByRole(completed, data?.roles ?? []),
        };
    }, [data?.roles, instances, workflowDefinition]);
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
                    <div>
                        {row.original.employees.length
                            ? row.original.employees.map((employee) => (
                                  <div key={employee}>{employee}</div>
                              ))
                            : "—"}
                    </div>
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
        <div className="flex flex-col gap-6">
            {isLoading && <PersonalLoadingState />}

            {!isLoading && isError && (
                <Card>
                    <Text className="text-red-700">{t("load_error")}</Text>
                </Card>
            )}

            {!isLoading && !isError && !hasRoleGroups && (
                <Card>
                    <Text>{t("empty_title")}</Text>
                </Card>
            )}

            {!isLoading && !isError && hasRoleGroups && (
                <>
                    <PersonalDisclosure
                        title={`${t("active")}${titleSuffix}`}
                        roleGroups={activeRoleGroups}
                        columns={columns}
                        defaultExpanded={true}
                    />
                    <PersonalDisclosure
                        title={`${t("completed")}${titleSuffix}`}
                        roleGroups={completedRoleGroups}
                        columns={columns}
                        defaultExpanded={completedRoleGroups.length === 0}
                    />
                </>
            )}
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
