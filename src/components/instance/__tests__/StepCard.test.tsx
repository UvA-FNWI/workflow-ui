import {cleanup, fireEvent, render, screen, within} from "@testing-library/react";
import {afterEach, expect, it, vi} from "vitest";

import {StepCard} from "../StepCard.tsx";
import type {
    Action,
    StepDeadline,
    WorkflowInstance,
    WorkflowStep,
} from "~/store/api/types/instances.ts";
import type {Submission} from "~/store/api/types/submissions.ts";

vi.mock("~/hooks/useTranslate.ts", () => ({
    useTranslate: () => ({
        l: (value?: {en: string}) => value?.en ?? "",
        t: (key: string) => key,
    }),
}));

vi.mock("~/components/instance/StepCardBody.tsx", () => ({
    StepCardBody: ({
        step,
        actions,
        resolvedAction,
        emptyStateMessage,
    }: {
        step: WorkflowStep;
        actions: Action[];
        resolvedAction: Action | null;
        emptyStateMessage: string | null;
    }) => (
        <div data-testid={`step-content-${step.id}`}>
            <span data-testid="step-content">{resolvedAction?.form ?? "Submission content"}</span>
            {emptyStateMessage && <span>{emptyStateMessage}</span>}
            <span data-testid={`actions-${step.id}`}>{actions.map((a) => a.id).join(",")}</span>
            <span data-testid={`version-count-${step.id}`}>
                {step.versions?.flatMap((version) => version.submissions).length ?? 0}
            </span>
        </div>
    ),
}));

afterEach(cleanup);

const deadline: StepDeadline = {
    date: "2000-01-01T00:00:00Z",
    type: "Hard",
    isPassed: false,
    message: null,
};

const makeStep = (overrides: Partial<WorkflowStep> = {}): WorkflowStep => ({
    id: "Step",
    title: {en: "Step", nl: "Stap"},
    icon: null,
    event: "Submit",
    dateCompleted: null,
    deadline,
    children: null,
    versions: null,
    headerStatus: null,
    resultsType: "Normal",
    expectsSubmission: true,
    hasSubmission: false,
    hierarchyMode: "Sequential",
    childrenLayout: "Combined",
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
        properties: [],
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

const expiredStatus = {
    type: "Error",
    label: null,
} as const;
const expiredMessage = {en: "**Too late.** Contact your coordinator.", nl: "Te laat."};

it("replaces an already open form with the configured hard deadline message after a refresh", () => {
    const step = makeStep();
    const {rerender} = render(<StepCard step={step} instance={makeInstance(step, [action])} />);
    expect(screen.getByText("Proposal")).toBeInTheDocument();

    const expiredStep = makeStep({
        deadline: {...deadline, isPassed: true, message: expiredMessage},
        headerStatus: expiredStatus,
        expectsSubmission: false,
    });
    rerender(<StepCard step={expiredStep} instance={makeInstance(expiredStep)} />);

    expect(screen.getByText("Too late.").tagName).toBe("STRONG");
    expect(screen.getByText("status.deadline_passed")).toBeInTheDocument();
    expect(screen.queryByTestId("step-content")).not.toBeInTheDocument();
});

it("keeps the form available for a passed soft deadline", () => {
    const step = makeStep({
        headerStatus: expiredStatus,
        deadline: {...deadline, type: "Soft", isPassed: true},
    });
    render(<StepCard step={step} instance={makeInstance(step, [action])} />);

    expect(screen.getByText("Proposal")).toBeInTheDocument();
    expect(screen.getByText("status.deadline_passed")).toBeInTheDocument();
    expect(screen.queryByText("instance.deadline_passed")).not.toBeInTheDocument();
});

it("shows a child deadline message while another parallel child's form remains available", () => {
    const child = makeStep({deadline: {...deadline, isPassed: true, message: expiredMessage}});
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
        deadline: {...deadline, isPassed: true, message: expiredMessage},
        headerStatus: expiredStatus,
        expectsSubmission: false,
    });
    const parent = makeStep({
        id: "Parent",
        deadline: null,
        headerStatus: expiredStatus,
        children: [child],
        expectsSubmission: false,
    });
    render(<StepCard step={parent} instance={makeInstance(parent)} />);

    expect(screen.getByText("Too late.")).toBeInTheDocument();
    expect(screen.queryByTestId("step-content")).not.toBeInTheDocument();
    expect(screen.getByText("status.deadline_passed")).toBeInTheDocument();
});

it("preserves completed step content without a deadline warning", () => {
    const step = makeStep({dateCompleted: "1999-12-31T00:00:00Z"});
    render(<StepCard step={step} instance={makeInstance(step)} />);

    expect(screen.getByTestId("step-content")).toBeInTheDocument();
    expect(screen.queryByText("status.deadline_passed")).not.toBeInTheDocument();
});

it("shows the default message when the backend reports closure without custom text", () => {
    const step = makeStep({deadline: {...deadline, isPassed: true}, expectsSubmission: false});
    render(<StepCard step={step} instance={makeInstance(step)} />);
    expect(screen.getByText("instance.deadline_passed")).toBeInTheDocument();
});

it("keeps a configured header label when a deadline has passed", () => {
    const step = makeStep({
        deadline: {...deadline, isPassed: true},
        headerStatus: {type: "Error", label: {en: "Contact staff", nl: "Neem contact op"}},
    });
    render(<StepCard step={step} instance={makeInstance(step)} />);
    expect(screen.getByText("Contact staff")).toBeInTheDocument();
    expect(screen.queryByText("status.deadline_passed")).not.toBeInTheDocument();
});

it("renders configured children as independently expandable rows with their own actions", () => {
    const first = makeStep({id: "Report1", title: {en: "Report 1", nl: "Rapport 1"}});
    const second = makeStep({id: "Report2", title: {en: "Report 2", nl: "Rapport 2"}});
    const parent = makeStep({
        id: "Reports",
        title: {en: "Reports", nl: "Rapporten"},
        children: [first, second],
        childrenLayout: "CollapsibleRows",
    } as Partial<WorkflowStep>);
    const instance = makeInstance(parent, [
        {...action, id: "first", form: "FirstForm", steps: [first.id]},
        {...action, id: "second", form: "SecondForm", steps: [second.id]},
        {...action, id: "shared", form: "SharedForm", steps: [first.id, second.id]},
    ]);
    instance.currentStep = first.id;

    render(<StepCard step={parent} instance={instance} />);

    expect(screen.getByRole("button", {name: /Report 1/})).toHaveAttribute("aria-expanded", "true");
    expect(screen.getByRole("button", {name: /Report 2/})).toHaveAttribute(
        "aria-expanded",
        "false",
    );
    expect(screen.getByTestId("actions-Report1")).toHaveTextContent("first,shared");
    expect(screen.queryByTestId("step-content-Report2")).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", {name: /Report 2/}));
    expect(screen.getByRole("button", {name: /Report 1/})).toHaveAttribute("aria-expanded", "true");
    expect(screen.getByRole("button", {name: /Report 2/})).toHaveAttribute("aria-expanded", "true");
    expect(screen.getByTestId("actions-Report2")).toHaveTextContent("second,shared");
});

it("keeps parent content above children without repeating child history", () => {
    const child = makeStep({
        id: "Report1",
        title: {en: "Report 1", nl: "Rapport 1"},
        headerStatus: {type: "Info", label: {en: "Awaiting review", nl: "In beoordeling"}},
        dateCompleted: null,
    });
    const childSubmission = {
        id: "submission",
        dateSubmitted: "2026-09-20T12:00:00Z",
        form: {
            name: "ReportForm",
            title: {en: "Report", nl: "Rapport"},
            layout: "Normal",
            pages: [],
            step: child.id,
        },
        answers: [],
        permissions: [],
    } satisfies Submission;
    const parent = makeStep({
        id: "Reports",
        title: {en: "Reports", nl: "Rapporten"},
        children: [child],
        childrenLayout: "CollapsibleRows",
        versions: [
            {
                versionNumber: 1,
                eventIds: [],
                submittedAt: "2026-09-20T12:00:00Z",
                submissions: [childSubmission],
            },
        ],
    } as Partial<WorkflowStep>);
    const instance = makeInstance(parent, [
        {...action, id: "parent", form: "ParentForm", steps: [parent.id]},
    ]);
    instance.currentStep = child.id;
    instance.submissions = [childSubmission];

    render(<StepCard step={parent} instance={instance} />);

    expect(
        within(screen.getByTestId("step-content-Reports")).getByText("ParentForm"),
    ).toBeVisible();
    expect(screen.getByTestId("version-count-Reports")).toHaveTextContent("0");
    expect(screen.getByRole("button", {name: /Report 1/})).toHaveTextContent("Awaiting review");
    expect(screen.getByRole("button", {name: /Report 1/})).toHaveTextContent("20/09/2026");
});

it("shows future child headers but does not expand rows without content", () => {
    const current = makeStep({id: "Current", title: {en: "Current", nl: "Huidig"}});
    const future = makeStep({
        id: "Future",
        title: {en: "Future", nl: "Toekomstig"},
        expectsSubmission: false,
        deadline: null,
    });
    const parent = makeStep({
        id: "Reports",
        children: [current, future],
        childrenLayout: "CollapsibleRows",
    } as Partial<WorkflowStep>);
    const instance = makeInstance(parent);
    instance.currentStep = current.id;

    render(<StepCard step={parent} instance={instance} />);

    expect(screen.getByRole("button", {name: /Future/})).toBeDisabled();
    expect(screen.queryByTestId("step-content-Future")).not.toBeInTheDocument();
});

it("does not show a submission date from history the viewer cannot access", () => {
    const child = makeStep({
        id: "Report1",
        title: {en: "Report 1", nl: "Rapport 1"},
        versions: [
            {
                versionNumber: 1,
                eventIds: [],
                submittedAt: "2026-09-20T12:00:00Z",
                submissions: [],
            },
        ],
    });
    const parent = makeStep({
        id: "Reports",
        children: [child],
        childrenLayout: "CollapsibleRows",
    } as Partial<WorkflowStep>);
    const instance = makeInstance(parent);
    instance.currentStep = child.id;

    render(<StepCard step={parent} instance={instance} />);

    const header = screen.getByRole("button", {name: /Report 1/});
    expect(header).toHaveTextContent("progress.deadline");
    expect(header).not.toHaveTextContent("status.submitted");
});

it.each([
    {hasSubmission: true, actions: [], message: "instance.unauthorized_submission"},
    {hasSubmission: false, actions: [], message: "instance.empty_step"},
    {hasSubmission: true, actions: [action], message: null},
])(
    "resolves the empty message with hasSubmission=$hasSubmission and actions=$actions.length",
    ({hasSubmission, actions, message}) => {
        const step = makeStep({hasSubmission});
        render(<StepCard step={step} instance={makeInstance(step, actions)} />);

        for (const key of ["instance.unauthorized_submission", "instance.empty_step"]) {
            if (key === message) {
                expect(screen.getByText(key)).toBeInTheDocument();
            } else {
                expect(screen.queryByText(key)).not.toBeInTheDocument();
            }
        }
    },
);
