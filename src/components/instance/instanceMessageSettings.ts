import type {WorkflowDefinition} from "~/store/api/types/workflowDefinitions";

export type InstanceMessageSettings = {
    card: boolean;
    layout: "threaded" | "flat";
    allowClose: boolean;
    callout: boolean;
};

export type MessageUiSettings = Pick<InstanceMessageSettings, "layout" | "allowClose">;

export const defaultMessageUi: MessageUiSettings = {
    layout: "threaded",
    allowClose: true,
};

const defaults: InstanceMessageSettings = {
    card: true,
    layout: "threaded",
    allowClose: true,
    callout: false,
};

export function resolveInstanceMessageSettings(
    workflowDefinition: WorkflowDefinition,
): InstanceMessageSettings | null {
    if (!workflowDefinition.messagesEnabled) return null;
    const settings = workflowDefinition.messages;
    if (!settings) return defaults;
    return {
        card: settings.card ?? true,
        layout: settings.layout === "flat" ? "flat" : "threaded",
        allowClose: settings.allowClose ?? true,
        callout: settings.callout ?? false,
    };
}
