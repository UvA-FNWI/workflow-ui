/** Property-only instance and admin data payload. */
export const propertiesInstance = {
    id: "context-admin",
    title: "Quantum Computing 2026",
    workflowDefinition: {
        name: "Context",
        title: null,
        titlePlural: {en: "Contexts", nl: "Contexts"},
        isPropertyOnly: true,
    },
    currentStep: null,
    parentId: null,
    fields: [],
    steps: [],
    submissions: [],
    actions: [],
    permissions: ["View", "Edit", "ViewAdminTools"],
    canUseAdminTools: true,
    canImpersonate: false,
    viewerRoles: ["Coordinator"],
    relatedUserGroups: {groups: []},
    resources: [],
};

export const propertiesInstanceNonAdmin = {
    ...propertiesInstance,
    id: "context-plain",
    permissions: ["View"],
    canUseAdminTools: false,
};

const question = (name: string, type: string, overrides: Record<string, unknown> = {}) => ({
    name,
    type,
    text: {en: name, nl: name},
    weight: null,
    percentage: null,
    isRequired: false,
    isArray: false,
    hideInResults: false,
    allowsExternalUsers: false,
    choices: [],
    subProperties: null,
    ...overrides,
});

export const instanceProperties = {
    properties: [
        question("Name", "String"),
        question("GradingBasis", "Choice", {
            text: {en: "Grading basis", nl: "Beoordelingsschaal"},
            choices: [
                {name: "Decimal", text: {en: "Decimal", nl: "Decimaal"}},
                {name: "PassFail", text: {en: "Pass/fail", nl: "Voldaan/niet voldaan"}},
            ],
        }),
        question("GradeGap", "Boolean", {text: {en: "Grade gap", nl: "Cijferkloof"}}),
        question("Coordinator", "User", {
            text: {en: "Coordinator", nl: "Coördinator"},
            isArray: true,
        }),
        // File editing is not supported here.
        question("StudyManual", "File", {text: {en: "Study manual", nl: "Studiehandleiding"}}),
        // Nested properties are edited separately.
        question("Assessment", "Object", {
            text: {en: "Assessment", nl: "Beoordeling"},
            workflowDefinition: "Assessment",
            subProperties: [question("Consent", "String"), question("Grade", "Double")],
        }),
    ],
    values: {
        Name: "Quantum Computing 2026",
        GradingBasis: "Decimal",
        GradeGap: false,
        Coordinator: [{displayName: "Ada Lovelace"}, {displayName: "Grace Hopper"}],
        StudyManual: "manual.pdf",
        "Assessment.Consent": "Yes",
        "Assessment.Grade": 8.5,
    } as Record<string, unknown>,
};
