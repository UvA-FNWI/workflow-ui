import {upperFirst} from "lodash-es";

import {type LocalString, useTranslate} from "~/hooks/useTranslate.ts";
import type {Callout} from "~/store/api/types/submissions";
import type {WorkflowDefinition} from "~/store/api/types/workflowDefinitions";

export type MessageUiSettings = {
    term: LocalString | null;
    termPlural: LocalString | null;
    layout: "threaded" | "flat";
    allowClose: boolean;
    maxReplyDepth: number | null;
    callout: Callout | null;
};

export const defaultMessageUi: MessageUiSettings = {
    term: null,
    termPlural: null,
    layout: "threaded",
    allowClose: true,
    maxReplyDepth: null,
    callout: null,
};

export function resolveInstanceMessageSettings(
    workflowDefinition: WorkflowDefinition | undefined,
): MessageUiSettings | null {
    if (!workflowDefinition?.messagesEnabled) return null;
    const settings = workflowDefinition.messages;
    return {
        term: settings?.term ?? null,
        termPlural: settings?.termPlural ?? null,
        layout: settings?.layout === "flat" ? "flat" : "threaded",
        allowClose: settings?.allowClose ?? true,
        maxReplyDepth: settings?.maxReplyDepth ?? null,
        callout: settings?.callout ?? null,
    };
}

export function useMessageTerms(settings?: MessageUiSettings | null) {
    const {t, l} = useTranslate("workflow", {keyPrefix: "instance.messages"});
    const term = l(settings?.term)?.trim() || t("default_term");
    const termPlural = l(settings?.termPlural)?.trim() || t("default_term_plural");
    return {term, termPlural, termTitle: upperFirst(term), termPluralTitle: upperFirst(termPlural)};
}
