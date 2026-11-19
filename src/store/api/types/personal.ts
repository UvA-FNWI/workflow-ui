import type {LocalString} from "~/hooks/useTranslate";
import type {ProgressInformation} from "~/store/api/types/progress";
import type {UserDto} from "~/store/api/types/users";

export type PersonalInstances = {
    person: UserDto;
    roles: PersonalRole[];
    instances: PersonalInstance[];
};

export type UserSearchResults = {
    people: UserDto[];
    hasMore: boolean;
};

export type PersonalRole = {
    name: string;
    title: LocalString;
};

export type PersonalInstance = {
    id: string;
    workflowDefinition: string;
    workflowDefinitionTitle: LocalString;
    title: string | null;
    currentStep: string | null;
    workflowStopped?: boolean;
    progress: ProgressInformation;
    createdOn: string;
    roles: string[];
    student: string | null;
    course: string | null;
    employees: string[];
};
