import type {ComponentProps} from "react";

import {cleanup, fireEvent, render, screen} from "@testing-library/react";
import {afterEach, describe, expect, it, vi} from "vitest";

import {StepCardBody} from "../StepCardBody.tsx";
import {
    makeAction,
    makeAssessment,
    makeInstance,
    makeStep,
    makeSubmission,
    makeVersion,
} from "~/components/instance/StepCard/__tests__/StepCardTestHelpers.ts";
import type {Action, WorkflowStep} from "~/store/api/types/instances.ts";

const {executeAction} = vi.hoisted(() => ({executeAction: vi.fn()}));

vi.mock("~/hooks/useTranslate.ts", () => ({
    useTranslate: () => ({
        l: (value?: {en: string} | null) => value?.en ?? "",
        t: (key: string, opts?: {versionNumber?: number}) =>
            opts?.versionNumber != null ? `${key} ${opts.versionNumber}` : key,
        i18n: {language: "en"},
    }),
}));
vi.mock("~/store/api/actionsApi.ts", () => ({
    actionsEndpoints: {executeAction: {useMutation: () => [executeAction]}},
}));
vi.mock("~/components/instance/FormSummary.tsx", () => ({
    FormSummary: ({submission}: {submission: {id: string}}) => (
        <div data-testid="form-summary">{submission.id}</div>
    ),
}));
vi.mock("~/components/AssessmentOverview/AssessmentOverview.tsx", () => ({
    AssessmentOverview: (p: {submissions: unknown[]; emptyMessage: string | null}) => (
        <div
            data-testid="assessment-overview"
            data-count={p.submissions.length}
            data-empty={p.emptyMessage ?? ""}
        />
    ),
}));
vi.mock("~/components/instance/FormPage.tsx", () => ({
    FormPage: (p: {submissionId: string; previousVersion?: number; onClose: () => void}) => (
        <div
            data-testid="form-page"
            data-submission-id={p.submissionId}
            data-previous-version={p.previousVersion ?? ""}
        >
            <button onClick={p.onClose}>close form</button>
        </div>
    ),
}));
vi.mock("~/components/instance/FormModal.tsx", () => ({
    FormModal: (p: {
        isOpen: boolean;
        submissionId: string;
        previousVersion?: number;
        onClose: () => void;
    }) =>
        p.isOpen ? (
            <div
                data-testid="form-modal"
                data-submission-id={p.submissionId}
                data-previous-version={p.previousVersion ?? ""}
            >
                <button onClick={p.onClose}>close modal</button>
            </div>
        ) : null,
}));
vi.mock("~/components/instance/VersionHistory.tsx", () => ({
    VersionHistory: (p: {versions: unknown[]; defaultExpandFirst: boolean}) => (
        <div
            data-testid="version-history"
            data-count={p.versions.length}
            data-expand-first={String(p.defaultExpandFirst)}
        />
    ),
}));

afterEach(() => {
    cleanup();
    executeAction.mockClear();
});

type Props = ComponentProps<typeof StepCardBody>;

const renderBody = (props: Partial<Props> = {}) => {
    const step: WorkflowStep = props.step ?? makeStep();
    const onSelectAction = vi.fn();
    render(
        <StepCardBody
            step={step}
            instance={makeInstance([step])}
            actions={[]}
            submissions={[]}
            activeAction={null}
            formState={null}
            emptyStateMessage={null}
            onSelectAction={onSelectAction}
            {...props}
        />,
    );
    return {onSelectAction};
};

const inPage = (action: Action): Props["formState"] => ({type: "inPage", action});

describe("background content", () => {
    it("shows the empty state message when there is no content", () => {
        renderBody({emptyStateMessage: "instance.empty_step"});
        expect(screen.getByText("instance.empty_step")).toHaveClass("italic");
    });

    it("renders nothing but the version history when empty without a message", () => {
        renderBody();
        expect(screen.queryByTestId("form-summary")).not.toBeInTheDocument();
        expect(screen.queryByTestId("assessment-overview")).not.toBeInTheDocument();
        expect(screen.queryByRole("button")).not.toBeInTheDocument();
    });

    it("renders a titled summary per regular submission, skipping unanswered ones", () => {
        renderBody({
            submissions: [
                makeSubmission({id: "a"}),
                makeSubmission({id: "b"}),
                makeSubmission({id: "empty", answers: []}),
            ],
        });
        expect(screen.getAllByTestId("form-summary").map((el) => el.textContent)).toEqual([
            "a",
            "b",
        ]);
        expect(screen.getAllByRole("heading", {name: "FORM 1"})).toHaveLength(2);
    });

    it("renders assessments in the assessment overview", () => {
        renderBody({
            submissions: [makeAssessment({id: "x"})],
            emptyStateMessage: "instance.empty_step",
        });
        const overview = screen.getByTestId("assessment-overview");
        expect(overview).toHaveAttribute("data-count", "1");
        expect(overview).toHaveAttribute("data-empty", "instance.empty_step");
        expect(screen.queryByTestId("form-summary")).not.toBeInTheDocument();
    });

    it("renders an empty assessment overview for non-normal result types", () => {
        renderBody({step: makeStep({resultsType: "AssessmentPartOverview"})});
        expect(screen.getByTestId("assessment-overview")).toHaveAttribute("data-count", "0");
    });
});

describe("version heading", () => {
    const step = makeStep({versions: {current: makeVersion(2), history: []}});

    it("shows the current version above submissions when no form is open", () => {
        renderBody({step, submissions: [makeSubmission()]});
        expect(
            screen.getByRole("heading", {name: "version_card.version_nr 2"}),
        ).toBeInTheDocument();
    });

    it("moves the version heading into the form area when a form is open", () => {
        const action = makeAction();
        renderBody({step, submissions: [makeSubmission()], formState: inPage(action)});

        const headings = screen.getAllByRole("heading", {name: "version_card.version_nr 2"});
        expect(headings).toHaveLength(1);
        expect(screen.getByTestId("form-page").parentElement).toContainElement(headings[0]!);
    });
});

describe("in-page form", () => {
    it("passes the form id and previous version to FormPage and closes via onSelectAction", () => {
        const action = makeAction();
        const step = makeStep({
            versions: {
                current: null,
                history: [makeVersion(3, [makeSubmission({id: action.form})])],
            },
        });
        const {onSelectAction} = renderBody({step, actions: [action], formState: inPage(action)});

        const page = screen.getByTestId("form-page");
        expect(page).toHaveAttribute("data-submission-id", action.form);
        expect(page).toHaveAttribute("data-previous-version", "3");
        expect(screen.queryByRole("button", {name: "Submit"})).not.toBeInTheDocument();

        fireEvent.click(screen.getByText("close form"));
        expect(onSelectAction).toHaveBeenCalledWith(null);
    });

    it("offers 'change selection' when several actions are available", () => {
        const a = makeAction({id: "a", title: {en: "Proposal", nl: "Voorstel"}});
        const b = makeAction({id: "b"});
        const {onSelectAction} = renderBody({
            actions: [a, b],
            activeAction: a,
            formState: inPage(a),
        });

        expect(screen.getByText("Proposal")).toBeInTheDocument();
        fireEvent.click(screen.getByRole("button", {name: /change_selection/}));
        expect(onSelectAction).toHaveBeenCalledWith(null);
    });

    it("hides 'change selection' for a single auto-opened action", () => {
        const action = makeAction();
        renderBody({actions: [action], activeAction: null, formState: inPage(action)});
        expect(screen.queryByRole("button", {name: /change_selection/})).not.toBeInTheDocument();
    });
});

describe("action buttons", () => {
    it("renders a button per action and selects it on click", () => {
        const approve = makeAction({
            id: "approve",
            type: "Execute",
            title: {en: "Approve", nl: "Goedkeuren"},
        });
        const reject = makeAction({
            id: "reject",
            intent: "Destructive",
            title: {en: "Reject", nl: "Afwijzen"},
        });
        const {onSelectAction} = renderBody({actions: [approve, reject]});

        fireEvent.click(screen.getByRole("button", {name: "Reject"}));
        expect(onSelectAction).toHaveBeenCalledWith(reject);
        expect(screen.getByRole("button", {name: "Approve"})).toBeInTheDocument();
    });
});

describe("version history", () => {
    it("expands the first history entry when there are no current submissions", () => {
        renderBody({step: makeStep({versions: {current: null, history: [makeVersion(1)]}})});
        const history = screen.getByTestId("version-history");
        expect(history).toHaveAttribute("data-count", "1");
        expect(history).toHaveAttribute("data-expand-first", "true");
    });

    it("keeps history collapsed when current submissions exist", () => {
        renderBody({submissions: [makeSubmission()]});
        expect(screen.getByTestId("version-history")).toHaveAttribute("data-expand-first", "false");
    });
});

describe("modals", () => {
    const approve = makeAction({
        name: "approve",
        type: "Execute",
        title: {en: "Approve", nl: "Goedkeuren"},
    });

    it("does not render any modal without an active action", () => {
        renderBody();
        expect(screen.queryByText("are_you_sure")).not.toBeInTheDocument();
        expect(screen.queryByTestId("form-modal")).not.toBeInTheDocument();
    });

    it("executes the action after confirmation and closes", () => {
        const {onSelectAction} = renderBody({activeAction: approve});

        expect(screen.getByText("Approve")).toBeInTheDocument();
        expect(screen.getByText("are_you_sure")).toBeInTheDocument();
        fireEvent.click(screen.getByRole("button", {name: "confirm"}));

        expect(executeAction).toHaveBeenCalledWith({
            instanceId: "instance",
            name: "approve",
            type: "Execute",
        });
        expect(onSelectAction).toHaveBeenCalledWith(null);
    });

    it("closes without executing on cancel", () => {
        const {onSelectAction} = renderBody({activeAction: approve});
        fireEvent.click(screen.getByRole("button", {name: "cancel"}));

        expect(executeAction).not.toHaveBeenCalled();
        expect(onSelectAction).toHaveBeenCalledWith(null);
    });

    it("opens the form modal for modal-layout forms", () => {
        const action = makeAction({formLayout: "Modal"});
        const step = makeStep({
            versions: {
                current: null,
                history: [makeVersion(4, [makeSubmission({id: action.form})])],
            },
        });
        const {onSelectAction} = renderBody({step, activeAction: action});

        const modal = screen.getByTestId("form-modal");
        expect(modal).toHaveAttribute("data-submission-id", action.form);
        expect(modal).toHaveAttribute("data-previous-version", "4");
        expect(screen.queryByText("are_you_sure")).not.toBeInTheDocument();

        fireEvent.click(screen.getByText("close modal"));
        expect(onSelectAction).toHaveBeenCalledWith(null);
    });
});
