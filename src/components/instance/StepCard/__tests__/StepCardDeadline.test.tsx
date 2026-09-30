import {cleanup, render, screen} from "@testing-library/react";
import {afterEach, expect, it, vi} from "vitest";

import {StepCard} from "../StepCard.tsx";
import {renderWithProviders} from "~/components/instance/__tests__/test-utils.tsx";
import {
    makeAction,
    makeDeadline,
    makeInstance,
    makeStep,
} from "~/components/instance/StepCard/__tests__/StepCardTestHelpers.ts";
import type {FormState} from "~/components/instance/StepCard/resolveContentState.ts";

vi.mock("~/hooks/useTranslate.ts", () => ({
    useTranslate: () => ({
        l: (value?: {en: string}) => value?.en ?? "",
        t: (key: string) => key,
        i18n: {language: "en"},
    }),
}));

vi.mock("~/components/instance/StepCardBody.tsx", () => ({
    StepCardBody: ({formState}: {formState: FormState}) => (
        <div data-testid="step-content">{formState?.action.form ?? "Submission content"}</div>
    ),
}));

afterEach(cleanup);

const expiredStatus = {
    type: "Error",
    label: null,
} as const;
const expiredMessage = {en: "**Too late.** Contact your coordinator.", nl: "Te laat."};

it("replaces an already open form with the configured hard deadline message after a refresh", () => {
    const step = makeStep();
    const action = makeAction();
    const {rerender} = renderWithProviders(
        <StepCard step={step} instance={makeInstance([step], {actions: [action]})} />,
    );
    expect(screen.getByText("Proposal")).toBeInTheDocument();
    const deadline = makeDeadline({isPassed: true, message: expiredMessage});

    const expiredStep = makeStep({
        deadline,
        headerStatus: expiredStatus,
        expectsSubmission: false,
    });
    rerender(<StepCard step={expiredStep} instance={makeInstance([expiredStep])} />);

    expect(screen.getByText("Too late.").tagName).toBe("STRONG");
    expect(screen.getByText("status.deadline_passed")).toBeInTheDocument();
    expect(screen.queryByTestId("step-content")).not.toBeInTheDocument();
});

it("keeps the form available for a passed soft deadline", () => {
    const deadline = makeDeadline({isPassed: true, type: "Soft"});
    const step = makeStep({
        headerStatus: expiredStatus,
        deadline,
    });
    const action = makeAction();
    renderWithProviders(
        <StepCard step={step} instance={makeInstance([step], {actions: [action]})} />,
    );

    expect(screen.getByText("Proposal")).toBeInTheDocument();
    expect(screen.getByText("status.deadline_passed")).toBeInTheDocument();
    expect(screen.queryByText("instance.deadline_passed")).not.toBeInTheDocument();
});

it("shows a child deadline message while another parallel child's form remains available", () => {
    const deadline = makeDeadline({isPassed: true, message: expiredMessage});
    const child = makeStep({deadline});
    const sibling = makeStep({id: "Sibling"});
    const parent = makeStep({id: "Parent", children: [child, sibling], hierarchyMode: "Parallel"});
    const action = makeAction({steps: ["Sibling"]});
    renderWithProviders(
        <StepCard step={parent} instance={makeInstance([parent], {actions: [action]})} />,
    );

    expect(screen.getByText("Too late.")).toBeInTheDocument();
    expect(screen.getByText("Proposal")).toBeInTheDocument();
});

it("replaces the parent card content when its expired child has no remaining actions", () => {
    const deadline = makeDeadline({isPassed: true, message: expiredMessage});
    const child = makeStep({
        deadline,
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
    render(<StepCard step={parent} instance={makeInstance([parent])} />);

    expect(screen.getByText("Too late.")).toBeInTheDocument();
    expect(screen.queryByTestId("step-content")).not.toBeInTheDocument();
    expect(screen.getByText("status.deadline_passed")).toBeInTheDocument();
});

it("preserves completed step content without a deadline warning", () => {
    const step = makeStep({dateCompleted: "1999-12-31T00:00:00Z"});
    render(<StepCard step={step} instance={makeInstance([step])} />);

    expect(screen.getByTestId("step-content")).toBeInTheDocument();
    expect(screen.queryByText("status.deadline_passed")).not.toBeInTheDocument();
});

it("shows the default message when the backend reports closure without custom text", () => {
    const deadline = makeDeadline({isPassed: true});
    const step = makeStep({deadline, expectsSubmission: false});
    render(<StepCard step={step} instance={makeInstance([step])} />);
    expect(screen.getByText("instance.deadline_passed")).toBeInTheDocument();
});

it("keeps a configured header label when a deadline has passed", () => {
    const deadline = makeDeadline({isPassed: true});
    const step = makeStep({
        deadline,
        headerStatus: {type: "Error", label: {en: "Contact staff", nl: "Neem contact op"}},
    });
    render(<StepCard step={step} instance={makeInstance([step])} />);
    expect(screen.getByText("Contact staff")).toBeInTheDocument();
    expect(screen.queryByText("status.deadline_passed")).not.toBeInTheDocument();
});
