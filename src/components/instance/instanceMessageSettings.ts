import type {LocalString} from "~/hooks/useTranslate.ts";
import type {Callout} from "~/store/api/types/submissions";
import type {WorkflowDefinition} from "~/store/api/types/workflowDefinitions";

export type InstanceMessageSettings = {
    card: boolean;
    cardTitle: LocalString | null;
    layout: "threaded" | "flat";
    allowClose: boolean;
    callout: Callout | null;
};

export type MessageUiSettings = Omit<InstanceMessageSettings, "card" | "cardTitle">;

export const defaultMessageUi: MessageUiSettings = {
    layout: "threaded",
    allowClose: true,
    callout: null,
};

const defaults: InstanceMessageSettings = {
    card: true,
    cardTitle: null,
    ...defaultMessageUi,
};

export function resolveInstanceMessageSettings(
    workflowDefinition: WorkflowDefinition | undefined,
): InstanceMessageSettings | null {
    if (!workflowDefinition?.messagesEnabled) return null;
    const settings = workflowDefinition.messages;
    if (!settings) return defaults;
    return {
        card: settings.card ?? true,
        cardTitle: settings.cardTitle ?? null,
        layout: settings.layout === "flat" ? "flat" : "threaded",
        allowClose: settings.allowClose ?? true,
        callout: settings.callout ?? null,
    };
}
