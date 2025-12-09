import type {Answer, Submission} from "./submissions";
import type {WorkflowInstance} from "~/store/api/types/instances.ts";

export type SaveAnswerResult = {
    answers: Answer[];
    submission: Submission;
};

export type ExecuteActionResult = {
    instance?: WorkflowInstance;
};
