import {Separator} from "@uva-fnwi/datanose-ui";

import {VersionCard} from "~/components/instance/VersionCard.tsx";
import type {WorkflowStepVersion} from "~/store/api/types/instances.ts";

type Props = {
    versions: WorkflowStepVersion[];
    instanceId: string;
    defaultExpandFirst: boolean;
};

export const VersionHistory = ({versions, instanceId, defaultExpandFirst}: Props) => {
    const versionsWithSubmissions = versions.filter((v) => v.submissions.length > 0);

    if (versionsWithSubmissions.length === 0) return null;

    return (
        <div className="flex flex-col">
            {versionsWithSubmissions.map((v, index, arr) => (
                <div key={v.versionNumber}>
                    {index > 0 && <Separator />}
                    <VersionCard
                        version={v}
                        instanceId={instanceId}
                        isExpandedByDefault={defaultExpandFirst && index === 0}
                    />
                    {index === arr.length - 1 && <Separator />}
                </div>
            ))}
        </div>
    );
};
