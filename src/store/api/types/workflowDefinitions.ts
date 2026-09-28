import type {LocalString} from "~/hooks/useTranslate";

export type WorkflowDefinition = {
    name: string;
    title: LocalString | null;
    titlePlural: LocalString;
    index: number | null;
    isAlwaysVisible: boolean;
    inheritsFrom: string | null;
    isEmbedded: boolean;
    screens: string[];
    /** Navigation hint populated by the Accessible endpoint. */
    hasOverviewAccess?: boolean;
    canCreateInstance: boolean;
    /** Whether the definition has no steps. */
    isPropertyOnly: boolean;
    properties: string[];
};
