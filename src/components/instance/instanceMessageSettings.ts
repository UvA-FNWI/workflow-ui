import {upperFirst} from "lodash-es";

import {type LocalString, useTranslate} from "~/hooks/useTranslate.ts";
import type {Callout} from "~/store/api/types/submissions";
import type {WorkflowDefinition} from "~/store/api/types/workflowDefinitions";

export type InstanceMessageSettings = {
    card: boolean;
    cardTitle: LocalString | null;
    term: LocalString | null;
    termPlural: LocalString | null;
    layout: "threaded" | "flat";
    allowClose: boolean;
    callout: Callout | null;
};

export type MessageUiSettings = Omit<InstanceMessageSettings, "card" | "cardTitle">;

export const defaultMessageUi: MessageUiSettings = {
    term: null,
    termPlural: null,
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
        term: settings.term ?? null,
        termPlural: settings.termPlural ?? null,
        layout: settings.layout === "flat" ? "flat" : "threaded",
        allowClose: settings.allowClose ?? true,
        callout: settings.callout ?? null,
    };
}

export function useMessageTerms(settings?: MessageUiSettings | null) {
    const {t, l} = useTranslate("workflow", {keyPrefix: "instance.messages"});
    const term = l(settings?.term)?.trim() || t("default_term");
    const termPlural = l(settings?.termPlural)?.trim() || t("default_term_plural");
    return {term, termPlural, termTitle: upperFirst(term), termPluralTitle: upperFirst(termPlural)};
}
