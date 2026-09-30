import type {ReactNode} from "react";

import {cleanup, render, screen} from "@testing-library/react";
import {afterEach, describe, expect, it, vi} from "vitest";

import {StepCardHeader} from "../StepCardHeader.tsx";
import {
    AMSTERDAM_MIDNIGHT,
    makeDeadline,
    makeStep,
} from "~/components/instance/StepCard/__tests__/StepCardTestHelpers.ts";
import type {StepHeaderStatus} from "~/store/api/types/instances.ts";

vi.mock("~/hooks/useTranslate.ts", () => ({
    useTranslate: () => ({
        l: (value?: {en: string} | null) => value?.en ?? "",
        t: (key: string) => key,
        i18n: {language: "en"},
    }),
}));

vi.mock("@uva-fnwi/datanose-ui", async (importOriginal) => ({
    ...(await importOriginal<typeof import("@uva-fnwi/datanose-ui")>()),
    Pill: ({variant, children}: {variant?: string | null; children?: ReactNode}) => (
        <span data-testid="pill" data-variant={variant}>
            {children}
        </span>
    ),
}));

afterEach(cleanup);

const COMPLETED = "2026-03-15T12:00:00Z"; // 15/03/2026 in Amsterdam

describe("title and pills", () => {
    it("renders the localized step title as an h2", () => {
        render(<StepCardHeader step={makeStep()} currentStepId={null} />);
        expect(screen.getByRole("heading", {level: 2, name: "Step 1"})).toBeInTheDocument();
    });

    it("shows no pill for an open step without a header status", () => {
        render(<StepCardHeader step={makeStep()} currentStepId={null} />);
        expect(screen.queryByTestId("pill")).not.toBeInTheDocument();
    });

    it("shows a green completed pill when there is no header status", () => {
        render(<StepCardHeader step={makeStep({dateCompleted: COMPLETED})} currentStepId={null} />);
        const pill = screen.getByTestId("pill");
        expect(pill).toHaveAttribute("data-variant", "green");
        expect(pill).toHaveTextContent("status.completed_on 15/03/2026");
    });

    it("prefers the header status over the completed pill", () => {
        const step = makeStep({
            dateCompleted: COMPLETED,
            headerStatus: {type: "Attention", label: {en: "Needs review", nl: "Controle"}},
        });
        render(<StepCardHeader step={step} currentStepId={null} />);
        expect(screen.getAllByTestId("pill")).toHaveLength(1);
        expect(screen.getByTestId("pill")).toHaveTextContent("Needs review");
    });

    it.each<[StepHeaderStatus["type"], string]>([
        ["Info", "grey"],
        ["Attention", "orange"],
        ["Success", "green"],
        ["Error", "red"],
    ])("maps %s status to the %s variant", (type, variant) => {
        const step = makeStep({headerStatus: {type, label: {en: "Label", nl: "Label"}}});
        render(<StepCardHeader step={step} currentStepId={null} />);
        expect(screen.getByTestId("pill")).toHaveAttribute("data-variant", variant);
    });

    it("falls back to 'deadline passed' when a nested child's deadline has passed", () => {
        const grandchild = makeStep({id: "gc", deadline: makeDeadline({isPassed: true})});
        const child = makeStep({id: "child", children: [grandchild]});
        const step = makeStep({children: [child], headerStatus: {type: "Error", label: null}});
        render(<StepCardHeader step={step} currentStepId={null} />);
        expect(screen.getByTestId("pill")).toHaveTextContent("status.deadline_passed");
    });

    it("renders an empty pill when there is no label and no passed deadline", () => {
        const step = makeStep({headerStatus: {type: "Info", label: null}});
        render(<StepCardHeader step={step} currentStepId={null} />);
        expect(screen.getByTestId("pill")).toBeEmptyDOMElement();
    });
});

describe("date label", () => {
    it("shows a date-only deadline when the Amsterdam time is midnight", () => {
        const step = makeStep({deadline: makeDeadline({date: AMSTERDAM_MIDNIGHT})});
        const {container} = render(<StepCardHeader step={step} currentStepId={null} />);
        expect(container).toHaveTextContent(/progress\.deadline:\s*15\/03\/2026$/);
    });

    it("includes the time when the deadline is not at midnight", () => {
        const step = makeStep({deadline: makeDeadline({date: "2026-03-15T11:30:00Z"})});
        const {container} = render(<StepCardHeader step={step} currentStepId={null} />);
        expect(container).toHaveTextContent(/progress\.deadline:\s*15\/03\/2026, 12:30/);
    });

    it("falls back to the deadline of the current child", () => {
        const child = makeStep({id: "child", deadline: makeDeadline()});
        const step = makeStep({children: [child]});
        const {container} = render(<StepCardHeader step={step} currentStepId="child" />);
        expect(container).toHaveTextContent(/progress\.deadline:\s*15\/03\/2026/);
    });

    it("ignores deadlines of children that are not current", () => {
        const child = makeStep({id: "child", deadline: makeDeadline()});
        const step = makeStep({children: [child]});
        const {container} = render(<StepCardHeader step={step} currentStepId="other" />);
        expect(container).not.toHaveTextContent("progress.deadline");
    });

    it("shows the latest submitted date across the step and children instead of the deadline", () => {
        const child = makeStep({id: "child", dateCompleted: "2026-03-15T12:00:00Z"});
        const step = makeStep({
            dateCompleted: "2026-03-10T12:00:00Z",
            deadline: makeDeadline(),
            children: [child],
        });
        const {container} = render(<StepCardHeader step={step} currentStepId={null} />);

        expect(container).toHaveTextContent(/status\.submitted:\s*15\/03\/2026/);
        expect(container).not.toHaveTextContent("progress.deadline");
    });

    it("shows no date label without deadline or completion", () => {
        const {container} = render(<StepCardHeader step={makeStep()} currentStepId={null} />);
        expect(container).not.toHaveTextContent(/progress\.deadline|status\.submitted/);
    });
});
