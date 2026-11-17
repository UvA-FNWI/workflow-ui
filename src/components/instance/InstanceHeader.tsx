import {useState} from "react";

import {Button, Icon} from "@uva-fnwi/datanose-ui";

import {ActionModal} from "~/components/instance/ActionModal";
import {FormPreviewModal} from "~/components/instance/FormPreviewModal";
import {HighlightedFields} from "~/components/instance/HighlightedFields.tsx";
import {PageHeader} from "~/components/PageHeader";
import {type LocalString, useTranslate} from "~/hooks/useTranslate";
import type {PreviewableForm} from "~/store/api/types/formPreviews";
import type {Action} from "~/store/api/types/instances";
import {useAppSelector} from "~/store/store";
import {actionIntentToButtonProps} from "~/utils/actionIntentToButtonProps";

interface InstanceHeaderProps {
    courseName?: LocalString | string | null;
    instanceId?: string;
    pinnedActions?: Action[];
    previewableForms?: PreviewableForm[];
    isLoading: boolean;
}

export function InstanceHeader({
    courseName,
    instanceId,
    pinnedActions = [],
    previewableForms = [],
    isLoading,
}: InstanceHeaderProps) {
    const {t, l} = useTranslate("workflow");
    const [activeActionId, setActiveActionId] = useState<string | null>(null);
    const [previewOpen, setPreviewOpen] = useState(false);
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
                    (pinnedActions.length > 0 || previewableForms.length > 0) && (
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
                            {!isLoading && previewableForms.length > 0 && (
                                <Button
                                    intent="ghost"
                                    aria-haspopup="dialog"
                                    leftIcon={<Icon name="visible-line" size="sm" decorative />}
                                    onClick={() => setPreviewOpen(true)}
                                >
                                    {t("form_preview.title")}
                                </Button>
                            )}
                        </div>
                    )
                }
                description={<HighlightedFields instanceId={instanceId} />}
            />
            {instanceId && previewOpen && previewableForms.length > 0 && (
                <FormPreviewModal
                    instanceId={instanceId}
                    forms={previewableForms}
                    onClose={() => setPreviewOpen(false)}
                />
            )}
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
