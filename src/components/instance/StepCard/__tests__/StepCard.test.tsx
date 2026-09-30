import type {ComponentProps} from "react";

import {cleanup, fireEvent, render, screen} from "@testing-library/react";
import {afterEach, describe, expect, it, vi} from "vitest";

import {StepCard} from "../StepCard.tsx";
import type {StepCardBody as StepCardBodyComponent} from "../StepCardBody.tsx";
import {
    makeAction,
    makeDeadline,
    makeInstance,
    makeStep,
    makeSubmission,
} from "./StepCardTestHelpers.ts";
import {renderWithProviders} from "~/components/instance/__tests__/test-utils.tsx";
import type {Action, WorkflowInstance, WorkflowStep} from "~/store/api/types/instances.ts";

type BodyProps = ComponentProps<typeof StepCardBodyComponent>;

vi.mock("~/hooks/useTranslate.ts", () => ({
    useTranslate: () => ({
        l: (value?: {en: string}) => value?.en ?? "",
        t: (key: string) => key,
        i18n: {language: "en"},
    }),
}));

vi.mock("~/components/instance/StepCardBody.tsx", () => ({
    StepCardBody: ({
        formState,
        actions,
        submissions,
        activeAction,
        emptyStateMessage,
        onSelectAction,
    }: BodyProps) => (
        <div
            data-testid="step-content"
            data-actions={actions.map((a) => a.id).join(",")}
            data-submissions={submissions.map((s) => s.id).join(",")}
            data-active-action={activeAction?.id ?? ""}
            data-empty-message={emptyStateMessage ?? ""}
        >
            <span>{formState?.action.form ?? "Submission content"}</span>
            {actions.map((a) => (
                <button key={a.id} onClick={() => onSelectAction(a)}>{`select ${a.id}`}</button>
            ))}
            <button onClick={() => onSelectAction(null)}>clear selection</button>
        </div>
    ),
}));

afterEach(cleanup);

const withSteps = (
    step: WorkflowStep,
    steps: WorkflowStep[],
    currentStep: string | null,
    actions: Action[] = [],
): WorkflowInstance => ({...makeInstance([step], {actions}), steps, currentStep});

const getHeaderButton = () => document.querySelector<HTMLButtonElement>("button[aria-expanded]")!;
const body = () => screen.getByTestId("step-content");
const idle: Partial<WorkflowStep> = {deadline: null, expectsSubmission: false};

describe("auto-opening forms", () => {
    it("does not auto-open when autoOpenForm is disabled", () => {
        const step = makeStep();
        const action = makeAction({autoOpenForm: false});
        render(<StepCard step={step} instance={makeInstance([step], {actions: [action]})} />);
        expect(screen.getByText("Submission content")).toBeInTheDocument();
        expect(body()).toHaveAttribute("data-active-action", "");
    });

    it("does not auto-open a form that has already been submitted", () => {
        const step = makeStep();
        const action = makeAction();
        const instance = {
            ...makeInstance([step], {actions: [action]}),
            submissions: [makeSubmission({dateSubmitted: "1999-12-31T00:00:00Z"})],
        };
        render(<StepCard step={step} instance={instance} />);
        expect(screen.queryByText("Proposal")).not.toBeInTheDocument();
    });

    it("auto-opens a form whose submission is still a draft", () => {
        const step = makeStep();
        const action = makeAction();
        const submission = makeSubmission({dateSubmitted: "1999-12-31T00:00:00Z"});
        const instance = makeInstance([step], {actions: [action], submissions: [submission]});
        render(<StepCard step={step} instance={instance} />);
        expect(screen.getByText("Proposal")).toBeInTheDocument();
    });

    it("never auto-opens Execute actions", () => {
        const step = makeStep();
        const action = makeAction({type: "Execute"});
        render(<StepCard step={step} instance={makeInstance([step], {actions: [action]})} />);
        expect(body()).toHaveAttribute("data-active-action", "");
        expect(screen.getByText("Submission content")).toBeInTheDocument();
    });

    it("auto-opens a modal form as the active action without rendering it in-page", () => {
        const action = makeAction({formLayout: "Modal"});
        const step = makeStep();
        render(<StepCard step={step} instance={makeInstance([step], {actions: [action]})} />);
        expect(body()).toHaveAttribute("data-active-action", action.id);
        expect(screen.getByText("Submission content")).toBeInTheDocument();
    });

    it("waits for an explicit choice when several actions exist and allows resetting it", () => {
        const action = makeAction({id: "SubmitForm_Proposal"});
        const report: Action = makeAction({id: "SubmitForm_Report", form: "Report"});
        const step = makeStep();
        render(
            <StepCard step={step} instance={makeInstance([step], {actions: [action, report]})} />,
        );
        expect(screen.getByText("Submission content")).toBeInTheDocument();

        fireEvent.click(screen.getByText("select SubmitForm_Report"));
        expect(screen.getByText("Report")).toBeInTheDocument();
        expect(body()).toHaveAttribute("data-active-action", report.id);

        fireEvent.click(screen.getByText("clear selection"));
        expect(screen.getByText("Submission content")).toBeInTheDocument();
    });

    it("falls back to the auto-open action when the selected action is revoked", () => {
        const report: Action = makeAction({id: "SubmitForm_Report", form: "Report"});
        const action = makeAction({id: "SubmitForm_Proposal"});
        const step = makeStep();
        const {rerender} = render(
            <StepCard step={step} instance={makeInstance([step], {actions: [action, report]})} />,
        );
        fireEvent.click(screen.getByText("select SubmitForm_Report"));

        rerender(<StepCard step={step} instance={makeInstance([step], {actions: [action]})} />);
        expect(screen.getByText("Proposal")).toBeInTheDocument();
        expect(body()).toHaveAttribute("data-active-action", "");
    });
});

describe("scoping to the step hierarchy", () => {
    it("only passes actions and submissions belonging to the step or its children", () => {
        const child = makeStep({id: "Child"});
        const parent = makeStep({id: "Parent", children: [child]});
        const childAction = makeAction({id: "child-action", steps: ["Child"]});
        const otherAction = makeAction({id: "other-action", steps: ["Other"]});
        const submissions = [
            makeSubmission({id: "child-sub"}, {step: "Child"}),
            makeSubmission({id: "other-sub"}, {step: "Other"}),
            makeSubmission({id: "no-step-sub"}, {step: undefined}),
        ];
        const instance = makeInstance([parent], {actions: [childAction, otherAction], submissions});
        render(<StepCard step={parent} instance={instance} />);

        expect(body()).toHaveAttribute("data-actions", "child-action");
        expect(body()).toHaveAttribute("data-submissions", "child-sub");
    });
});

describe("empty state message", () => {
    it("reports an unauthorized submission when one exists but is not visible", () => {
        const step = makeStep({...idle, hasSubmission: true});
        render(<StepCard step={step} instance={makeInstance([step])} />);
        expect(body()).toHaveAttribute("data-empty-message", "instance.unauthorized_submission");
    });

    it("treats a current version as a visible submission", () => {
        const step = makeStep({
            deadline: null,
            hasSubmission: true,
            versions: {
                current: {versionNumber: 1, completionTimestamp: null, submissions: []},
                history: [],
            },
        });
        render(<StepCard step={step} instance={makeInstance([step])} />);
        expect(body()).toHaveAttribute("data-empty-message", "instance.empty_step");
    });

    it("reports an empty step when a child expects a submission", () => {
        const child = makeStep({id: "Child", expectsSubmission: true, deadline: null});
        const parent = makeStep({...idle, id: "Parent", children: [child]});
        render(<StepCard step={parent} instance={makeInstance([parent])} />);
        expect(body()).toHaveAttribute("data-empty-message", "instance.empty_step");
    });

    it("omits the message while a form is open", () => {
        const step = makeStep({hasSubmission: true});
        const action = makeAction();
        render(<StepCard step={step} instance={makeInstance([step], {actions: [action]})} />);
        expect(body()).toHaveAttribute("data-empty-message", "");
    });
});

describe("disclosure state", () => {
    it("expands the current step by default", () => {
        const step = makeStep();
        render(<StepCard step={step} instance={makeInstance([step])} />);
        expect(getHeaderButton()).toHaveAttribute("aria-expanded", "true");
        expect(body()).toBeVisible();
    });

    it("expands a parent step when one of its children is current", () => {
        const child = makeStep({id: "Child"});
        const parent = makeStep({id: "Parent", children: [child]});
        render(
            <StepCard step={parent} instance={{...makeInstance([parent]), currentStep: "Child"}} />,
        );
        expect(getHeaderButton()).toHaveAttribute("aria-expanded", "true");
    });

    it("collapses a past step but lets the user open it", () => {
        const past = makeStep({id: "Past", dateCompleted: "1999-12-31T00:00:00Z"});
        const current = makeStep({id: "Current"});
        render(<StepCard step={past} instance={withSteps(past, [past, current], "Current")} />);

        expect(getHeaderButton()).toBeEnabled();
        expect(body()).not.toBeVisible();
        fireEvent.click(getHeaderButton());
        expect(body()).toBeVisible();
    });

    it("disables a future step without actions or deadline messages", () => {
        const current = makeStep({id: "Current"});
        const future = makeStep({id: "Future", deadline: null});
        render(
            <StepCard step={future} instance={withSteps(future, [current, future], "Current")} />,
        );

        expect(getHeaderButton()).toBeDisabled();
        expect(getHeaderButton()).not.toHaveClass("cursor-default!");
        expect(body()).not.toBeVisible();
    });

    it("keeps a future step enabled when it has available actions", () => {
        const current = makeStep({id: "Current"});
        const future = makeStep({id: "Future"});
        const action = makeAction();
        const instance = withSteps(future, [current, future], "Current", [
            {...action, steps: ["Future"]},
        ]);
        renderWithProviders(<StepCard step={future} instance={instance} />);
        expect(getHeaderButton()).toBeEnabled();
    });

    it("keeps a future step enabled when it has a deadline message", () => {
        const deadline = makeDeadline();
        const current = makeStep({id: "Current"});
        const future = makeStep({id: "Future", deadline: {...deadline, isPassed: true}});
        render(
            <StepCard step={future} instance={withSteps(future, [current, future], "Current")} />,
        );
        expect(getHeaderButton()).toBeEnabled();
    });

    it("does not disable steps when the instance has no current step", () => {
        const step = makeStep();
        const instance = makeInstance([step], {currentStep: null});
        render(<StepCard step={step} instance={instance} />);
        expect(getHeaderButton()).toBeEnabled();
        expect(getHeaderButton()).toHaveAttribute("aria-expanded", "false");
    });

    it("renders a static, contentless header when there is nothing to show", () => {
        const step = makeStep(idle);
        render(<StepCard step={step} instance={makeInstance([step])} />);

        expect(getHeaderButton()).toBeDisabled();
        expect(getHeaderButton()).toHaveClass("cursor-default!");
        expect(screen.queryByTestId("step-content")).not.toBeInTheDocument();
    });

    it.each<[string, Partial<WorkflowStep>]>([
        [
            "version history",
            {
                versions: {
                    current: null,
                    history: [{versionNumber: 1, completionTimestamp: null, submissions: []}],
                },
            },
        ],
        ["a non-normal results type", {resultsType: "AssessmentFinalOverview"}],
    ])("renders the body for %s", (_, overrides) => {
        const step = makeStep({...idle, ...overrides});
        renderWithProviders(<StepCard step={step} instance={makeInstance([step])} />);
        expect(body()).toBeInTheDocument();
        expect(getHeaderButton()).toBeEnabled();
    });

    it("renders the body for a visible submission", () => {
        const step = makeStep(idle);
        render(
            <StepCard
                step={step}
                instance={{...makeInstance([step]), submissions: [makeSubmission()]}}
            />,
        );
        expect(body()).toHaveAttribute("data-submissions", "Proposal");
    });
});
