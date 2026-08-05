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
    canCreateInstance: boolean;
    /** Whether the definition has no steps. */
    isPropertyOnly: boolean;
};
