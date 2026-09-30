import type {
    Action,
    StepDeadline,
    WorkflowInstance,
    WorkflowStep,
    WorkflowStepVersion,
} from "~/store/api/types/instances.ts";
import type {Page, Submission} from "~/store/api/types/submissions.ts";

/** 2026-03-15 00:00 in Amsterdam (CET, UTC+1), i.e. a date without a relevant time. */
export const AMSTERDAM_MIDNIGHT = "2026-03-14T23:00:00Z";

export const makeDeadline = (overrides: Partial<StepDeadline> = {}): StepDeadline => ({
    date: AMSTERDAM_MIDNIGHT,
    type: "Hard",
    isPassed: false,
    message: null,
    ...overrides,
});

export const makeStep = (overrides: Partial<WorkflowStep> = {}): WorkflowStep => ({
    id: "step-1",
    title: {en: "Step 1", nl: "Stap 1"},
    icon: null,
    event: "event-1",
    dateCompleted: null,
    deadline: null,
    children: null,
    versions: null,
    headerStatus: null,
    hierarchyMode: "Sequential",
    resultsType: "Normal",
    expectsSubmission: false,
    hasSubmission: false,
    ...overrides,
});

export const makeAction = (overrides: Partial<Action> = {}): Action => ({
    id: "SubmitForm_Proposal",
    name: "SubmitProposal",
    type: "SubmitForm",
    form: "Proposal",
    title: {en: "Submit", nl: "Indienen"},
    steps: ["Step"],
    intent: "Primary",
    formLayout: "Normal",
    ...overrides,
});

const makePage = (hasResults: boolean): Page => ({
    index: 0,
    name: "page-1",
    title: {en: "Page 1", nl: "Pagina 1"},
    layout: "Normal",
    elements: [],
    hasResults,
    isInCurrentForm: true,
});

export const makeSubmission = (
    overrides: Partial<Submission> = {},
    form: Partial<Submission["form"]> = {},
): Submission => ({
    id: "Proposal",
    permissions: [],
    answers: [],
    ...overrides,
    form: {
        name: "Proposal",
        title: {en: "Proposal", nl: "Voorstel"},
        layout: "Normal",
        pages: [],
        step: "Step",
        ...form,
    },
});

export const makeAssessment = (overrides: Partial<Submission> = {}): Submission =>
    makeSubmission(overrides, {
        name: "assessment",
        title: {en: "Assessment", nl: "Beoordeling"},
        pages: [makePage(true)],
    });

export const makeVersion = (
    versionNumber: number,
    submissions: Submission[] = [],
): WorkflowStepVersion => ({
    versionNumber,
    completionTimestamp: "2026-01-01T00:00:00Z",
    submissions,
});

export const makeInstance = (
    steps: WorkflowStep[],
    overrides: Partial<WorkflowInstance> = {},
): WorkflowInstance => ({
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
    currentStep: steps[0]?.id ?? null,
    fields: [],
    steps,
    submissions: [],
    actions: [],
    permissions: [],
    canUseAdminTools: false,
    canImpersonate: false,
    viewerRoles: [],
    infoCards: [],
    ...overrides,
});
