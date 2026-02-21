import type {Answer, Submission} from "./submissions";
import type {LocalString} from "~/hooks/useTranslate.ts";
import type {WorkflowInstance} from "~/store/api/types/instances.ts";

export type SaveAnswerResult = {
    answers: Answer[];
    submission: Submission;
};

export type ExecuteActionResult = {
    instance?: WorkflowInstance;
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
