import type {ActionType} from "~/store/api/types/instances.ts";

export type SaveAnswerParams = {
    instanceId: string;
    submissionId: string;
    answer: AnswerInput;
};

export type AnswerInput = {
    questionName: string;
    value: unknown;
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
