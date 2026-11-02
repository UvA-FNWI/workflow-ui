import {useState} from "react";

import {Button} from "@uva-fnwi/datanose-ui";

import {ActionModal} from "~/components/instance/ActionModal";
import {HighlightedFields} from "~/components/instance/HighlightedFields.tsx";
import {PageHeader} from "~/components/PageHeader";
import {type LocalString, useTranslate} from "~/hooks/useTranslate";
import type {Action} from "~/store/api/types/instances";
import {useAppSelector} from "~/store/store";
import {actionIntentToButtonProps} from "~/utils/actionIntentToButtonProps";

interface InstanceHeaderProps {
    courseName?: LocalString | string | null;
    instanceId?: string;
    pinnedActions?: Action[];
    isLoading: boolean;
}

export function InstanceHeader({
    courseName,
    instanceId,
    pinnedActions = [],
    isLoading,
}: InstanceHeaderProps) {
    const {t, l} = useTranslate("workflow");
    const [activeActionId, setActiveActionId] = useState<string | null>(null);
    const activeAction = pinnedActions.find((action) => action.id === activeActionId) ?? null;
    const homePath = useAppSelector((state) => state.homeNavigation.homePath);

    const displayTitle =
        (typeof courseName === "string" ? courseName : l(courseName)) ||
        t("instance.workflowInstance");

    return (
        <>
            <PageHeader
                title={displayTitle}
                backLabel={homePath === "/" ? t("home") : t("admin_data.back_to_overview")}
                backTo={homePath}
                isLoading={isLoading}
                actions={
                    instanceId &&
                    pinnedActions.length > 0 && (
                        <div className="flex flex-wrap gap-2">
                            {pinnedActions.map((action) => (
                                <Button
                                    key={action.id}
                                    {...actionIntentToButtonProps(action.intent)}
                                    onClick={() => setActiveActionId(action.id)}
                                >
                                    {l(action.title)}
                                </Button>
                            ))}
                        </div>
                    )
                }
                description={<HighlightedFields instanceId={instanceId} />}
            />
            {instanceId && activeAction && (
                <ActionModal
                    key={activeAction.id}
                    instanceId={instanceId}
                    action={activeAction}
                    onClose={() => setActiveActionId(null)}
                />
            )}
        </>
    );
}
