import type {Answer, Submission} from "./submissions";

export type SaveAnswerResult = {
    answers: Answer[];
    submission: Submission;
};
