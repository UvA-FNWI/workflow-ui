import type {Answer, Submission} from "./submissions";
import type {LocalString} from "~/hooks/useTranslate.ts";
import type {ActionType, WorkflowInstance} from "~/store/api/types/instances.ts";

export type SaveAnswerResult = {
    answers: Answer[];
    submission: Submission;
};

export type ExecuteActionResult = {
    type: ActionType;
    instance?: WorkflowInstance;
    result: {
        redirectUrl: string | null;
    };
};

export type SubmitSubmissionResult = {
    submission: Submission;
    updatedInstance?: WorkflowInstance;
    validationErrors: ValidationError[];
};

export type ValidationError = {
    questionName: string;
    validationMessage: LocalString;
};
