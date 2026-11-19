import type {LocalString} from "~/hooks/useTranslate.ts";
import type {WorkflowDefinition} from "~/store/api/types/workflowDefinitions";

export type InstanceMessageSettings = {
    card: boolean;
    cardTitle: LocalString | null;
    layout: "threaded" | "flat";
    allowClose: boolean;
    callout: boolean;
    calloutTitle: LocalString | null;
    calloutText: LocalString | null;
};

export type MessageUiSettings = Omit<InstanceMessageSettings, "card" | "cardTitle">;

export const defaultMessageUi: MessageUiSettings = {
    layout: "threaded",
    allowClose: true,
    callout: false,
    calloutTitle: null,
    calloutText: null,
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
        callout: settings.callout ?? false,
        calloutTitle: settings.calloutTitle ?? null,
        calloutText: settings.calloutText ?? null,
    };
}
