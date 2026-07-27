import type {LocalString} from "~/hooks/useTranslate";

export type PersonalInstance = {
    id: string;
    workflowDefinition: string;
    workflowDefinitionTitle: LocalString;
    title: string | null;
    currentStep: string | null;
    createdOn: string;
    roles: string[];
    student: string | null;
    course: string | null;
    employees: string[];
};
