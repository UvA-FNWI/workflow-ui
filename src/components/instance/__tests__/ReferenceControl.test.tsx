import type {ComponentProps} from "react";

import "@testing-library/jest-dom/vitest";
import {cleanup, render, screen} from "@testing-library/react";
import {afterEach, describe, expect, it, vi} from "vitest";

import {ReferenceControl} from "../ReferenceControl";
import type {Question} from "~/store/api/types/submissions";

vi.mock("~/hooks/useTranslate", () => ({
    useTranslate: () => ({
        t: (key: string) => key,
        l: (value?: {en?: string}) => value?.en ?? "",
        i18n: {language: "en"},
    }),
}));
vi.mock("~/store/api/answersApi", () => ({
    answersApi: {
        useGetChoicesQuery: () => ({data: undefined, isLoading: false, isError: false}),
    },
}));

const department = {name: "dept-1", text: {en: "ICTS", nl: "ICTS"}};
function referenceQuestion(isArray: boolean): Question {
    return {
        name: "Department",
        type: "Reference",
        text: {en: "Department", nl: "Afdeling"},
        weight: null,
        percentage: null,
        isRequired: false,
        isArray,
        hideInResults: false,
        allowsExternalUsers: false,
        choices: [],
        layout: {type: "RadioList"},
        workflowDefinition: "Department",
    };
}
function renderControl(props: Partial<ComponentProps<typeof ReferenceControl>> = {}) {
    return render(
        <ReferenceControl
            instanceId="inst"
            submissionId="sub"
            question={referenceQuestion(true)}
            onChange={vi.fn()}
            choices={[]}
            {...props}
        />,
    );
}

afterEach(cleanup);
describe("ReferenceControl RadioList", () => {
    it("shows loading copy for an array list without checkboxes", () => {
        renderControl({choicesLoading: true, choices: []});
        expect(screen.getByText("reference.loading")).toBeInTheDocument();
        expect(screen.queryByRole("checkbox")).not.toBeInTheDocument();
    });
    it("shows load_error for an array list without checkboxes", () => {
        renderControl({choicesError: true, choices: []});
        expect(screen.getByText("reference.load_error")).toBeInTheDocument();
        expect(screen.queryByRole("checkbox")).not.toBeInTheDocument();
    });
    it("shows empty copy for an array list without checkboxes", () => {
        renderControl({choices: []});
        expect(screen.getByText("reference.empty")).toBeInTheDocument();
        expect(screen.queryByRole("checkbox")).not.toBeInTheDocument();
    });
    it("renders checkboxes and no status when choices exist", () => {
        renderControl({choices: [department]});
        expect(screen.getByRole("checkbox", {name: "ICTS"})).toBeInTheDocument();
        expect(screen.queryByText("reference.loading")).not.toBeInTheDocument();
        expect(screen.queryByText("reference.empty")).not.toBeInTheDocument();
        expect(screen.queryByText("reference.load_error")).not.toBeInTheDocument();
    });
    it("shows loading copy for a single RadioList without radios", () => {
        renderControl({
            question: referenceQuestion(false),
            choicesLoading: true,
            choices: [],
        });
        expect(screen.getByText("reference.loading")).toBeInTheDocument();
        expect(screen.queryByRole("radio")).not.toBeInTheDocument();
    });
});
