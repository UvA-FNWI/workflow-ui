import {useMemo} from "react";

import {createColumnHelper} from "@tanstack/react-table";
import {Button, Heading, Text, useToast} from "@uva-fnwi/datanose-ui";

import {DataTable} from "~/components/Table/DataTable";
import {VersionedLink} from "~/components/VersionedLink";
import {useTranslate} from "~/hooks/useTranslate";
import {useVersionedNavigate} from "~/hooks/useVersionedNavigate";
import {instancesEndpoints} from "~/store/api/instancesApi";
import type {InstanceSummary} from "~/store/api/types/instances";
import type {WorkflowDefinition} from "~/store/api/types/workflowDefinitions";
import {formatDateShort} from "~/utils/formatDate";

type WorkflowInstancesPanelProps = {
    definition: WorkflowDefinition;
};
const columnHelper = createColumnHelper<InstanceSummary>();

export function WorkflowInstancesPanel({definition}: WorkflowInstancesPanelProps) {
    const {t, l, i18n} = useTranslate("workflow", {keyPrefix: "develop"});
    const toast = useToast();
    const navigate = useVersionedNavigate();
    const {
        data: instances,
        isLoading,
        isError,
    } = instancesEndpoints.getInstances.useQuery(definition.name);
    const [createInstance, {isLoading: isCreating}] =
        instancesEndpoints.createInstance.useMutation();
    const [recalculateCurrentSteps, {isLoading: isRecalculating}] =
        instancesEndpoints.recalculateCurrentSteps.useMutation();

    const onCreate = async () => {
        const created = await createInstance({workflowDefinition: definition.name}).unwrap();
        navigate(`/instance/${created.id}`);
    };

    const onRecalculateCurrentSteps = async () => {
        try {
            const result = await recalculateCurrentSteps(definition.name).unwrap();
            toast.success(t("recalculate_current_steps_success", result));
        } catch {
            toast.error(t("recalculate_current_steps_error"));
        }
    };

    const columns = useMemo(
        () => [
            columnHelper.accessor("id", {
                header: t("columns.id"),
                cell: (info) => (
                    <VersionedLink
                        to={`/instance/${info.getValue()}`}
                        className="text-red-brand underline hover:opacity-80"
                    >
                        {info.getValue()}
                    </VersionedLink>
                ),
            }),
            columnHelper.accessor("title", {
                header: t("columns.title"),
                cell: (info) => {
                    const value = info.getValue() || "—";
                    return (
                        <Text size={"sm"} truncate={true} className="max-w-100">
                            {value}
                        </Text>
                    );
                },
            }),
            columnHelper.accessor("createdOn", {
                header: t("columns.created"),
                cell: (info) => {
                    const createdOn = info.getValue();
                    return createdOn ? formatDateShort(createdOn, i18n.language) : "—";
                },
            }),
        ],
        [t, i18n.language],
    );

    return (
        <div className="flex flex-col gap-4">
            <div className="my-4 flex items-center justify-between">
                <Heading as="h2" size="md" className="mb-0">
                    {l(definition.titlePlural)}
                </Heading>
                <div className="flex flex-wrap items-center justify-end gap-2">
                    <Button
                        intent="secondary"
                        onClick={() => void onRecalculateCurrentSteps()}
                        isLoading={isRecalculating}
                        type="button"
                    >
                        {t("recalculate_current_steps")}
                    </Button>
                    {definition.canCreateInstance && (
                        <Button
                            intent="primary"
                            onClick={() => void onCreate()}
                            isLoading={isCreating}
                            type="button"
                        >
                            {t("new", {name: l(definition.title) ?? definition.name})}
                        </Button>
                    )}
                </div>
            </div>
            {isLoading ? (
                <p className="text-sm text-grey-700 dark:text-grey-300">{t("loading")}</p>
            ) : isError ? (
                <p className="text-sm text-red-brand">{t("load_error")}</p>
            ) : instances && instances.length > 0 ? (
                <DataTable
                    data={instances}
                    columns={columns}
                    getRowId={(row) => row.id}
                    initialSorting={[{id: "createdOn", desc: true}]}
                />
            ) : (
                <p className="text-sm text-grey-700 dark:text-grey-300">{t("no_instances")}</p>
            )}
        </div>
    );
}
