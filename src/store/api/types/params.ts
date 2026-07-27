import type {ActionType} from "~/store/api/types/instances.ts";
import type {CreateExternalUserInput} from "~/store/api/types/users.ts";

export type SaveAnswerParams = {
    instanceId: string;
    submissionId: string;
    answer: AnswerInput;
};

export type AnswerInput = {
    questionName: string;
    value: unknown;
    externalUser?: CreateExternalUserInput;
};

export type SaveFileParams = {
    instanceId: string;
    submissionId: string;
    questionName: string;
    file: File;
};

export type FileParams = {
    questionName: string;
    file?: File | null;
    deleteFileId?: string | null;
};

export type ExecuteActionParams = {
    instanceId: string;
    type: ActionType;
    name: string;
};

export type UpdatePropertyParams = {
    instanceId: string;
    property: string;
    value: unknown;
    externalUser?: CreateExternalUserInput;
};

export type DeletePropertyParams = {
    instanceId: string;
    property: string;
    itemId?: string;
};
