import type {LocalString} from "~/hooks/useTranslate";
import type {IconVariant} from "~/store/api/types/instances";

export type WorkflowScreen = {
    name: string;
    title: LocalString | null;
    description: LocalString | null;
    index: number | null;
};

export type WorkflowDefinition = {
    name: string;
    title: LocalString | null;
    titlePlural: LocalString;
    description: LocalString | null;
    index: number | null;
    icon: IconVariant | null;
    isAlwaysVisible: boolean;
    inheritsFrom: string | null;
    isEmbedded: boolean;
    screens: WorkflowScreen[];
    canCreateInstance: boolean;
    /** Whether the definition has no steps. */
    isPropertyOnly: boolean;
    properties: string[];
};
