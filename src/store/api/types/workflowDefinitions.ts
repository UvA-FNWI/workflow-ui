import type {LocalString} from "~/hooks/useTranslate";
import type {Callout} from "~/store/api/types/submissions";

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
    properties: string[];
    messagesEnabled?: boolean;
    messages?: {
        card?: boolean;
        cardTitle?: LocalString | null;
        fieldsAllowAll?: boolean;
        layout?: "threaded" | "flat";
        allowClose?: boolean;
        callout?: Callout | null;
    };
};
