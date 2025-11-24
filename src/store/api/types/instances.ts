import type {LocalString} from "~/hooks/useTranslate";

export type WorkflowInstance = {
    id: string;
    title: string | null;
    steps: WorkflowStep[];
};

export type WorkflowStep = {
    id: string;
    title: LocalString;
    event: string;
    dateCompleted: string | null;
    children: WorkflowStep[] | null;
};
