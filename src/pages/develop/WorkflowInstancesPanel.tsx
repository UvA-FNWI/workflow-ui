import {Button, Heading} from "@uva-fnwi/datanose-ui";

import {VersionedLink} from "~/components/VersionedLink";
import {useTranslate} from "~/hooks/useTranslate";
import {useVersionedNavigate} from "~/hooks/useVersionedNavigate";
import {instancesEndpoints} from "~/store/api/instancesApi";
import type {WorkflowDefinition} from "~/store/api/types/workflowDefinitions";

type WorkflowInstancesPanelProps = {
    definition: WorkflowDefinition;
};

export function WorkflowInstancesPanel({definition}: WorkflowInstancesPanelProps) {
    const {t, l} = useTranslate(["workflow", "common"]);
    const navigate = useVersionedNavigate();
    const {
        data: instances,
        isLoading,
        isError,
    } = instancesEndpoints.getInstances.useQuery(definition.name);
    const [createInstance, {isLoading: isCreating}] =
        instancesEndpoints.createInstance.useMutation();

    const onCreate = async () => {
        const created = await createInstance({workflowDefinition: definition.name}).unwrap();
        navigate(`/instance/${created.id}`);
    };

    return (
        <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
                <Heading as="h2" size="md">
                    {l(definition.titlePlural)}
                </Heading>
                {definition.canCreateInstance && (
                    <Button intent="primary" onClick={onCreate} disabled={isCreating} type="button">
                        {t("develop.new", {name: l(definition.title) ?? definition.name})}
                    </Button>
                )}
            </div>
            {isLoading ? (
                <p className="text-sm text-grey-700 dark:text-grey-300">{t("develop.loading")}</p>
            ) : isError ? (
                <p className="text-sm text-red-brand">{t("develop.load_error")}</p>
            ) : instances && instances.length > 0 ? (
                <ul className="flex flex-col gap-1">
                    {instances.map((instance) => (
                        <li key={instance.Id}>
                            <VersionedLink
                                to={`/instance/${instance.Id}`}
                                className="text-sm text-red-brand underline hover:opacity-80"
                            >
                                {instance.Id}
                            </VersionedLink>
                        </li>
                    ))}
                </ul>
            ) : (
                <p className="text-sm text-grey-700 dark:text-grey-300">
                    {t("develop.no_instances")}
                </p>
            )}
        </div>
    );
}
