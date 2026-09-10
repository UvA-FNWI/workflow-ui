import {cleanup, render, screen} from "@testing-library/react";
import {afterEach, expect, it, vi} from "vitest";

import {StepCard} from "../StepCard.tsx";
import type {Action, WorkflowInstance, WorkflowStep} from "~/store/api/types/instances.ts";

vi.mock("~/hooks/useTranslate.ts", () => ({
    useTranslate: () => ({
        l: (value?: {en: string}) => value?.en ?? "",
        t: (key: string) => key,
    }),
}));

vi.mock("~/components/instance/StepCardBody.tsx", () => ({
    StepCardBody: ({resolvedAction}: {resolvedAction: Action | null}) => (
        <div data-testid="step-content">{resolvedAction?.form ?? "Submission content"}</div>
    ),
}));

afterEach(cleanup);

const makeStep = (overrides: Partial<WorkflowStep> = {}): WorkflowStep => ({
    id: "Step",
    title: {en: "Step", nl: "Stap"},
    icon: null,
    event: "Submit",
    dateCompleted: null,
    deadline: "2000-01-01T00:00:00Z",
    deadlinePassed: false,
    deadlineMessage: null,
    children: null,
    versions: null,
    headerStatus: null,
    resultsType: "Normal",
    expectsSubmission: true,
    hasSubmission: false,
    hierarchyMode: "Sequential",
    ...overrides,
});

const action: Action = {
    id: "SubmitForm_Proposal",
    name: "SubmitProposal",
    type: "SubmitForm",
    form: "Proposal",
    title: {en: "Submit", nl: "Indienen"},
    steps: ["Step"],
    intent: "Primary",
    formLayout: "Normal",
};

const makeInstance = (step: WorkflowStep, actions: Action[] = []): WorkflowInstance => ({
    id: "instance",
    title: null,
    workflowDefinition: {
        name: "Project",
        title: null,
        titlePlural: {en: "Projects", nl: "Projecten"},
        index: null,
        isAlwaysVisible: true,
        inheritsFrom: null,
        isEmbedded: false,
        screens: [],
        canCreateInstance: false,
        isPropertyOnly: false,
    },
    currentStep: step.id,
    fields: [],
    steps: [step],
    submissions: [],
    actions,
    permissions: [],
    canUseAdminTools: false,
    canImpersonate: false,
    viewerRoles: [],
    infoCards: [],
});

const expiredMessage = {en: "**Too late.** Contact your coordinator.", nl: "Te laat."};

it("replaces an already open form with the configured hard deadline message after a refresh", () => {
    const step = makeStep();
    const {rerender} = render(<StepCard step={step} instance={makeInstance(step, [action])} />);
    expect(screen.getByText("Proposal")).toBeInTheDocument();

    const expiredStep = makeStep({
        deadlinePassed: true,
        deadlineMessage: expiredMessage,
        expectsSubmission: false,
    });
    rerender(<StepCard step={expiredStep} instance={makeInstance(expiredStep)} />);

    expect(screen.getByText("Too late.").tagName).toBe("STRONG");
    expect(screen.getByText("status.deadline_passed")).toBeInTheDocument();
    expect(screen.queryByTestId("step-content")).not.toBeInTheDocument();
});

it("keeps the form available for a passed soft deadline", () => {
    const step = makeStep({deadlinePassed: true});
    render(<StepCard step={step} instance={makeInstance(step, [action])} />);

    expect(screen.getByText("Proposal")).toBeInTheDocument();
    expect(screen.getByText("status.deadline_passed")).toBeInTheDocument();
});

it("shows a child deadline message while another parallel child's form remains available", () => {
    const child = makeStep({deadlinePassed: true, deadlineMessage: expiredMessage});
    const sibling = makeStep({id: "Sibling"});
    const parent = makeStep({id: "Parent", children: [child, sibling], hierarchyMode: "Parallel"});
    render(
        <StepCard
            step={parent}
            instance={makeInstance(parent, [{...action, steps: ["Sibling"]}])}
        />,
    );

    expect(screen.getByText("Too late.")).toBeInTheDocument();
    expect(screen.getByText("Proposal")).toBeInTheDocument();
});

it("replaces the parent card content when its expired child has no remaining actions", () => {
    const child = makeStep({
        deadlinePassed: true,
        deadlineMessage: expiredMessage,
        expectsSubmission: false,
    });
    const parent = makeStep({id: "Parent", children: [child], expectsSubmission: false});
    render(<StepCard step={parent} instance={makeInstance(parent)} />);

    expect(screen.getByText("Too late.")).toBeInTheDocument();
    expect(screen.queryByTestId("step-content")).not.toBeInTheDocument();
});

it("preserves completed step content without a deadline warning", () => {
    const step = makeStep({deadlinePassed: false, dateCompleted: "1999-12-31T00:00:00Z"});
    render(<StepCard step={step} instance={makeInstance(step)} />);

    expect(screen.getByTestId("step-content")).toBeInTheDocument();
    expect(screen.queryByText("status.deadline_passed")).not.toBeInTheDocument();
});
