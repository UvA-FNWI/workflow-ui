import type {InstanceProperties} from "../../src/store/api/types/instances";
import type {QuestionBase} from "../../src/store/api/types/submissions";

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
    infoCards: [],
};

export const propertiesInstanceNonAdmin = {
    ...propertiesInstance,
    id: "context-plain",
    permissions: ["View"],
    canUseAdminTools: false,
};

const question = (name: string): QuestionBase => ({
    name,
    text: {en: name, nl: name},
    weight: null,
    percentage: null,
    isRequired: false,
    isArray: false,
    hideInResults: false,
});

export const instanceProperties = {
    properties: [
        {...question("Name"), type: "String"},
        {
            ...question("GradingBasis"),
            type: "Choice",
            text: {en: "Grading basis", nl: "Beoordelingsschaal"},
            choices: [
                {name: "Decimal", text: {en: "Decimal", nl: "Decimaal"}},
                {name: "PassFail", text: {en: "Pass/fail", nl: "Voldaan/niet voldaan"}},
            ],
        },
        {...question("GradeGap"), type: "Check", text: {en: "Grade gap", nl: "Cijferkloof"}},
        {
            ...question("Coordinator"),
            type: "User",
            text: {en: "Coordinator", nl: "Coördinator"},
            isArray: true,
            allowsExternalUsers: false,
        },
        // File editing is not supported here.
        {
            ...question("StudyManual"),
            type: "File",
            text: {en: "Study manual", nl: "Studiehandleiding"},
            allowedFileTypes: ["pdf"],
            allowedFileSize: 10_000_000,
        },
        // Nested properties are edited separately.
        {
            ...question("Assessment"),
            type: "Object",
            text: {en: "Assessment", nl: "Beoordeling"},
            workflowDefinition: "Assessment",
            subProperties: [
                {...question("Consent"), type: "String"},
                {...question("Grade"), type: "Double"},
            ],
        },
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
} satisfies InstanceProperties;
