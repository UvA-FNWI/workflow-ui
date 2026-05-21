import type {LocalString} from "~/hooks/useTranslate";

export type WorkflowDefinition = {
    name: string;
    title: LocalString;
    titlePlural: LocalString;
    index: number | null;
    isAlwaysVisible: boolean;
    inheritsFrom: string | null;
    isEmbedded: boolean;
    screens: string[] | null;
};

export type CreateWorkflowInstanceParams = {
    workflowDefinition: string;
    parentId?: string;
    initialProperties?: Record<string, unknown>;
};
