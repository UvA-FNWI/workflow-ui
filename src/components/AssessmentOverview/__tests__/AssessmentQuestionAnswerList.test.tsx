import {cleanup, fireEvent, render, screen} from "@testing-library/react";
import {afterEach, expect, it, vi} from "vitest";

import {AssessmentQuestionAnswerList} from "../AssessmentQuestionAnswerList.tsx";
import type {Answer, Question} from "~/store/api/types/submissions.ts";
import {getVisibleQuestionAnswerPairs, type QuestionAnswerPair} from "~/utils/submissionUtils.ts";

vi.mock("~/hooks/useTranslate.ts", () => ({
    useTranslate: () => ({
        t: (key: string) => key,
        l: (value?: {en?: string}) => value?.en ?? "",
        i18n: {language: "en"},
    }),
}));
vi.mock("~/components/instance/AnswerCell.tsx", () => ({
    AnswerCell: ({pair}: {pair?: QuestionAnswerPair}) => (
        <span>{`${pair?.columnTitle?.en}: ${pair?.answer?.value ?? "-"}`}</span>
    ),
}));

afterEach(cleanup);

it.each([null, "Selected explanation"])(
    "omits missing combined explanations while retaining configured source results: %s",
    (combinedExplanation) => {
        const questions = [
            {name: "Grade", type: "Double", text: {en: "Grade"}},
            {name: "Explanation", type: "String", linkedTo: "Grade"},
        ] as Question[];
        const answer = (questionName: string, value: string | number): Answer => ({
            id: questionName,
            questionName,
            value,
            isVisible: true,
            files: [],
        });
        const pairs = (title: string, answers: Answer[]) =>
            getVisibleQuestionAnswerPairs(questions, answers, undefined, {en: title, nl: title});

        render(
            <AssessmentQuestionAnswerList
                instanceId="instance"
                questionAnswerPairs={[
                    pairs("Supervisor", [answer("Grade", 8), answer("Explanation", "Reason")]),
                    pairs("Second assessor", [
                        answer("Grade", 7),
                        answer("Explanation", "Comment"),
                    ]),
                    pairs("Average", [
                        answer("Grade", 7.5),
                        ...(combinedExplanation
                            ? [answer("Explanation", combinedExplanation)]
                            : []),
                    ]),
                ]}
            />,
        );

        fireEvent.click(screen.getByText("instance.summary.show_linked"));

        expect(screen.getByText("Supervisor: Reason")).toBeInTheDocument();
        expect(screen.getByText("Second assessor: Comment")).toBeInTheDocument();
        expect(screen.queryByText("Average: -")).not.toBeInTheDocument();
        expect(screen.getByText("Average: 7.5")).toBeInTheDocument();
        if (combinedExplanation) {
            expect(screen.getByText(`Average: ${combinedExplanation}`)).toBeInTheDocument();
        }
    },
);
