import {Provider} from "react-redux";

import {cleanup, render, screen} from "@testing-library/react";
import {afterEach, expect, it, vi} from "vitest";

import {StepCard} from "../StepCard.tsx";
import type {WorkflowInstance, WorkflowStep} from "~/store/api/types/instances.ts";
import {store} from "~/store/store.ts";

vi.mock("~/hooks/useTranslate.ts", () => ({
    useTranslate: () => ({
        l: (value?: {en: string}) => value?.en ?? "",
        t: (key: string, values?: {versionNumber: number}) =>
            values ? `Version ${values.versionNumber}` : key,
        i18n: {language: "en"},
    }),
}));
afterEach(cleanup);

it("renders backend current and history numbers even when attempts have no visible submissions", () => {
    const step: WorkflowStep = {
        id: "Writing",
        title: {en: "Writing", nl: "Schrijven"},
        icon: null,
        event: "",
        dateCompleted: null,
        deadline: null,
        children: null,
        headerStatus: null,
        resultsType: "Normal",
        expectsSubmission: false,
        hasSubmission: false,
        hierarchyMode: "Sequential",
        childrenLayout: "Combined",
        submissions: [],
        versions: {
            current: {versionNumber: 7, completionTimestamp: null, submissions: []},
            history: [{versionNumber: 3, completionTimestamp: null, submissions: []}],
        },
    };
    const instance = {
        id: "instance",
        currentStep: "Writing",
        steps: [step],
        actions: [],
        submissions: [],
        permissions: [],
    } as unknown as WorkflowInstance;
    render(
        <Provider store={store}>
            <StepCard step={step} instance={instance} />
        </Provider>,
    );
    expect(screen.getByText("Version 7")).toBeVisible();
    expect(screen.getByText("Version 3")).toBeVisible();
    expect(screen.queryByText("Version 4")).not.toBeInTheDocument();
    expect(screen.queryByText("Invalid Date")).not.toBeInTheDocument();
});

it("renders only the submissions assigned to the current attempt", () => {
    const assigned = {
        id: "Assigned",
        dateSubmitted: "2026-01-01T00:00:00Z",
        permissions: [],
        answers: [{id: "a", questionName: "q", value: "answer", isVisible: true, files: []}],
        form: {
            name: "Assigned",
            title: {en: "Assigned form", nl: ""},
            layout: "Normal",
            pages: [],
            step: "Writing",
        },
    } as import("~/store/api/types/submissions.ts").Submission;
    const step: WorkflowStep = {
        id: "Writing",
        title: {en: "Writing", nl: ""},
        icon: null,
        event: "",
        dateCompleted: null,
        deadline: null,
        children: null,
        headerStatus: null,
        resultsType: "Normal",
        expectsSubmission: false,
        hasSubmission: true,
        hierarchyMode: "Sequential",
        childrenLayout: "Combined",
        submissions: [assigned],
        versions: {
            current: {versionNumber: 2, completionTimestamp: null, submissions: [assigned]},
            history: [],
        },
    };
    const stale = {
        ...assigned,
        id: "Stale",
        form: {...assigned.form, title: {en: "Stale form", nl: ""}},
    };
    const instance = {
        id: "instance",
        currentStep: "Writing",
        steps: [step],
        actions: [],
        submissions: [stale],
        permissions: [],
    } as unknown as WorkflowInstance;
    render(
        <Provider store={store}>
            <StepCard step={step} instance={instance} />
        </Provider>,
    );
    expect(screen.getByText("ASSIGNED FORM")).toBeVisible();
    expect(screen.queryByText("STALE FORM")).not.toBeInTheDocument();
    expect(screen.getByText("Version 2")).toBeVisible();
});

it.each(["Combined", "CollapsibleRows"] as const)(
    "keeps independent child attempts accessible in the %s layout",
    (childrenLayout) => {
        const child: WorkflowStep = {
            id: "Writing",
            title: {en: "Writing", nl: ""},
            icon: null,
            event: "",
            dateCompleted: null,
            deadline: null,
            children: null,
            headerStatus: null,
            resultsType: "Normal",
            expectsSubmission: false,
            hasSubmission: false,
            hierarchyMode: "Sequential",
            childrenLayout: "Combined",
            submissions: [],
            versions: {
                current: {versionNumber: 5, completionTimestamp: null, submissions: []},
                history: [{versionNumber: 4, completionTimestamp: null, submissions: []}],
            },
        };
        const step: WorkflowStep = {
            ...child,
            id: "Thesis",
            title: {en: "Thesis", nl: ""},
            children: [child],
            childrenLayout,
            versions: {
                current: {versionNumber: 1, completionTimestamp: null, submissions: []},
                history: [],
            },
        };
        const instance = {
            id: "instance",
            currentStep: "Writing",
            steps: [step],
            actions: [],
            submissions: [],
            permissions: [],
        } as unknown as WorkflowInstance;
        render(
            <Provider store={store}>
                <StepCard step={step} instance={instance} />
            </Provider>,
        );
        expect(screen.getByText("Version 1")).toBeVisible();
        expect(screen.getByText("Writing")).toBeVisible();
        expect(screen.getByText("Version 4")).toBeVisible();
        expect(screen.getByText("Version 5")).toBeVisible();
    },
);
