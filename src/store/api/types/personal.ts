import type {LocalString} from "~/hooks/useTranslate";
import type {ProgressInformation} from "~/store/api/types/progress";
import type {MilestonesPerson} from "~/store/api/types/users";

export type PersonalRole = {
    name: string;
    title: LocalString;
};

export type PersonalInstances = {
    roles: PersonalRole[];
    instances: PersonalInstance[];
};

export type PersonInstances = PersonalInstances & {person: MilestonesPerson};

export type PersonalInstance = {
    id: string;
    workflowDefinition: string;
    workflowDefinitionTitle: LocalString;
    title: string | null;
    currentStep: string | null;
    progress: ProgressInformation;
    createdOn: string;
    roles: string[];
    student: string | null;
    course: string | null;
    employees: string[];
};
