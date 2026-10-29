import {Provider} from "react-redux";

import {act, cleanup, fireEvent, render, screen} from "@testing-library/react";
import {ToastProvider} from "@uva-fnwi/datanose-ui";
import {afterEach, expect, it, vi} from "vitest";

import {StepCard} from "../StepCard.tsx";
import {submissionsApi} from "~/store/api/submissionsApi.ts";
import type {WorkflowInstance, WorkflowStep} from "~/store/api/types/instances.ts";
import type {Action} from "~/store/api/types/instances.ts";
import type {Submission} from "~/store/api/types/submissions.ts";
import {store} from "~/store/store.ts";

vi.mock("~/hooks/useTranslate.ts", () => ({
    useTranslate: () => ({
        l: (value?: {en: string}) => value?.en ?? "",
        t: (key: string, values?: {versionNumber: number}) =>
            values ? `Version ${values.versionNumber}` : key,
        i18n: {language: "en"},
    }),
}));
afterEach(() => {
    cleanup();
    store.dispatch(submissionsApi.util.resetApiState());
});

it.each(["Normal", "Compact", "Modal"] as const)(
    "opens %s forms from allowed actions and uses visible attempt history for the prefill notice",
    async (formLayout) => {
        const submission: Submission = {
            id: "Draft",
            dateSubmitted: undefined,
            permissions: [],
            answers: [
                {
                    id: "answer",
                    questionName: "Title",
                    value: "Retained",
                    isVisible: true,
                    files: [],
                },
            ],
            form: {
                name: "Draft",
                title: {en: "Draft", nl: ""},
                layout: formLayout,
                pages: [
                    {
                        index: 0,
                        name: "Main",
                        title: {en: "Main", nl: ""},
                        layout: "Normal",
                        elements: [],
                        hasResults: false,
                        isInCurrentForm: true,
                        isActive: true,
                    },
                ],
            },
        };
        await act(async () => {
            await store.dispatch(
                submissionsApi.util.upsertQueryData(
                    "getSubmission",
                    {instanceId: "instance", submissionId: "Draft"},
                    submission,
                ),
            );
        });
        const step = {
            id: "Writing",
            title: {en: "Writing", nl: ""},
            isAvailable: true,
            children: null,
            submissions: [],
            versions: {
                current: {versionNumber: 2, completionTimestamp: null, submissions: []},
                history: [
                    {
                        versionNumber: 1,
                        completionTimestamp: null,
                        submissions: [{...submission, dateSubmitted: "2026-01-01T00:00:00Z"}],
                    },
                ],
            },
            resultsType: "Normal",
            expectsSubmission: true,
        } as unknown as WorkflowStep;
        const action = {
            id: "SubmitDraft",
            type: "SubmitForm",
            form: "Draft",
            title: {en: "Submit draft", nl: ""},
            steps: ["Writing"],
            formLayout,
            autoOpenForm: formLayout !== "Modal",
            intent: "Primary",
        } as Action;
        const instance = {
            id: "instance",
            currentStep: "Writing",
            steps: [step],
            actions: [action],
        } as unknown as WorkflowInstance;
        const renderCard = (value: WorkflowInstance) => (
            <Provider store={store}>
                <ToastProvider>
                    <StepCard step={step} instance={value} />
                </ToastProvider>
            </Provider>
        );
        const {rerender} = render(renderCard(instance));
        if (formLayout === "Modal") {
            expect(screen.queryByText("repeated_form.message")).not.toBeInTheDocument();
            fireEvent.click(screen.getByRole("button", {name: "Submit draft"}));
        }
        expect(await screen.findByText("repeated_form.message")).toBeVisible();
        rerender(
            renderCard({
                ...instance,
                actions: [action, {...action, id: "Other", type: "Execute", name: "Other"}],
            }),
        );
        expect(screen.getByText("repeated_form.message")).toBeVisible();
        if (formLayout !== "Modal") {
            fireEvent.click(screen.getByRole("button", {name: /^Writing/}));
            expect(screen.queryByText("repeated_form.message")).not.toBeInTheDocument();
            fireEvent.click(screen.getByRole("button", {name: /^Writing/}));
            expect(await screen.findByText("repeated_form.message")).toBeVisible();
        }
        rerender(renderCard({...instance, actions: []}));
        expect(screen.queryByText("repeated_form.message")).not.toBeInTheDocument();
    },
);

it("opens execution confirmation only after selection and closes it on cancel", () => {
    const step = {
        id: "Writing",
        title: {en: "Writing", nl: ""},
        isAvailable: true,
        children: null,
        submissions: [],
        versions: null,
        resultsType: "Normal",
        expectsSubmission: false,
    } as unknown as WorkflowStep;
    const action = {
        id: "Approve",
        name: "Approve",
        type: "Execute",
        title: {en: "Approve", nl: ""},
        steps: ["Writing"],
        intent: "Primary",
    } as Action;
    const instance = {
        id: "instance",
        currentStep: "Writing",
        steps: [step],
        actions: [action],
    } as unknown as WorkflowInstance;
    render(
        <Provider store={store}>
            <StepCard step={step} instance={instance} />
        </Provider>,
    );
    expect(screen.queryByText("are_you_sure")).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", {name: "Approve"}));
    expect(screen.getByText("are_you_sure")).toBeVisible();
    fireEvent.click(screen.getByRole("button", {name: "cancel"}));
    expect(screen.queryByText("are_you_sure")).not.toBeInTheDocument();
});

it("renders backend current and history numbers even when attempts have no visible submissions", () => {
    const step: WorkflowStep = {
        id: "Writing",
        isAvailable: true,
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

it.each([true, false])(
    "renders step-assigned submissions when attempt history is available: %s",
    (hasAttempts) => {
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
            isAvailable: true,
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
            versions: hasAttempts
                ? {
                      current: {versionNumber: 2, completionTimestamp: null, submissions: []},
                      history: [],
                  }
                : null,
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
        expect(screen.queryByText("Version 2")).not.toBeInTheDocument();
    },
);

it.each(["Combined", "CollapsibleRows"] as const)(
    "keeps independent child attempts accessible in the %s layout",
    (childrenLayout) => {
        const child: WorkflowStep = {
            id: "Writing",
            isAvailable: true,
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
        expect(screen.queryByText("Version 1")).not.toBeInTheDocument();
        expect(screen.getByText("Writing")).toBeVisible();
        expect(screen.getByText("Version 4")).toBeVisible();
        expect(screen.getByText("Version 5")).toBeVisible();
    },
);

it.each([false, true])(
    "shows all API-visible summary submissions above the version history after resubmission: %s",
    (resubmitted) => {
        const makeSubmission = (id: string, value: string): Submission => ({
            id,
            dateSubmitted: "2026-10-01T10:00:00Z",
            permissions: [],
            answers: [
                {id: `${id}-answer`, questionName: "Feedback", value, isVisible: true, files: []},
            ],
            form: {
                name: id,
                title: {en: id, nl: ""},
                layout: "Normal",
                step: "Writing",
                pages: [
                    {
                        index: 0,
                        name: "Main",
                        title: {en: "Main", nl: ""},
                        layout: "Normal",
                        hasResults: false,
                        isActive: true,
                        isInCurrentForm: true,
                        elements: [
                            {
                                kind: "Question",
                                question: {
                                    name: "Feedback",
                                    text: {en: "Feedback", nl: ""},
                                    type: "String",
                                    isRequired: false,
                                    isArray: false,
                                    hideInResults: false,
                                },
                            },
                        ],
                    },
                ],
            },
        });
        const reviews = [
            makeSubmission("Supervisor review", "Changes required"),
            makeSubmission("Reviewer review", "Approved by reviewer"),
        ];
        const proposal = makeSubmission("Proposal", "Revised proposal");
        const visible = resubmitted ? [proposal] : reviews;
        const step: WorkflowStep = {
            id: "Writing",
            title: {en: "Writing", nl: ""},
            isAvailable: true,
            children: null,
            icon: null,
            event: "",
            dateCompleted: null,
            deadline: null,
            headerStatus: null,
            resultsType: "Normal",
            expectsSubmission: !resubmitted,
            hasSubmission: visible.length > 0,
            hierarchyMode: "Sequential",
            childrenLayout: "Combined",
            submissions: visible,
            versions: {
                current: {
                    versionNumber: 2,
                    completionTimestamp: null,
                    submissions: resubmitted ? [proposal] : [],
                },
                history: [{versionNumber: 1, completionTimestamp: null, submissions: reviews}],
            },
        };
        const instance = {
            id: "instance",
            currentStep: "Writing",
            steps: [step],
            submissions: [],
            actions: resubmitted
                ? []
                : [
                      {
                          id: "Revise",
                          type: "SubmitForm",
                          form: "Proposal",
                          formLayout: "Modal",
                          steps: ["Writing"],
                          title: {en: "Revise proposal", nl: ""},
                          intent: "Primary",
                      },
                  ],
        } as unknown as WorkflowInstance;

        render(
            <Provider store={store}>
                <ToastProvider>
                    <StepCard step={step} instance={instance} />
                </ToastProvider>
            </Provider>,
        );

        for (const submission of visible) {
            expect(
                screen.getByRole("heading", {name: submission.form.title.en.toUpperCase()}),
            ).toBeVisible();
            expect(screen.getAllByText(String(submission.answers[0].value))[0]).toBeVisible();
        }
        expect(screen.queryByText("0", {exact: true})).not.toBeInTheDocument();
        const history = screen.getByRole("button", {name: /Version 1/});
        expect(history).toHaveAttribute("aria-expanded", "false");
        if (resubmitted) {
            expect(
                screen.queryByRole("heading", {name: "SUPERVISOR REVIEW"}),
            ).not.toBeInTheDocument();
            fireEvent.click(history);
            expect(screen.getByText("Changes required")).toBeVisible();
        } else {
            const revise = screen.getByRole("button", {name: "Revise proposal"});
            expect(
                screen.getAllByText("Changes required")[0].compareDocumentPosition(revise) &
                    Node.DOCUMENT_POSITION_FOLLOWING,
            ).toBeTruthy();
            expect(
                revise.compareDocumentPosition(history) & Node.DOCUMENT_POSITION_FOLLOWING,
            ).toBeTruthy();
        }
    },
);
