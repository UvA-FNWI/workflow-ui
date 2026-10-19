import {afterEach, beforeEach, describe, expect, it, vi} from "vitest";
import {Document} from "yaml";

import type {QuestionKind} from "../types";

const common = {name: {}, type: {}, text: {}, description: {}, condition: {}, linkedTo: {}};
const propertySchema = {
    anyOf: [
        {
            properties: {
                ...common,
                type: {enum: ["String", "String!"]},
                multiline: {},
                allowAttachments: {},
                variant: {},
            },
        },
        {properties: {...common, type: {enum: ["Date", "Date!"]}}},
        {properties: {...common, type: {enum: ["Int", "Int!"]}, calculation: {}}},
        {
            properties: {
                ...common,
                type: {enum: ["User", "User!", "[User]", "[User]!"]},
                allowsExternalUsers: {},
            },
        },
        {
            properties: {
                ...common,
                type: {not: {enum: ["String", "Date", "Int", "User", "[User]"]}},
                filter: {},
                inheritedRoles: {},
            },
        },
        {
            properties: {
                ...common,
                type: {not: {enum: ["String", "Date", "Int", "User", "[User]"]}},
                values: {},
                layout: {},
                calculation: {},
                rubric: {},
            },
        },
    ],
};

const ENTITY_PATH = "Definitions/Thesis/Entity.yaml";
const FORM_PATH = "Definitions/Thesis/Forms/Proposal.yaml";

async function switchKind(property: Record<string, unknown>, kind: QuestionKind) {
    const {changeQuestionKind} = await import("../questions");
    const doc = new Document({name: "Thesis", properties: [{name: "Value", ...property}]});
    const docs = new Map([[ENTITY_PATH, doc]]);
    expect(await changeQuestionKind(docs, FORM_PATH, "Value", kind)).toEqual([ENTITY_PATH]);
    return doc.toJSON().properties[0];
}

describe("question type switching", () => {
    beforeEach(() => {
        vi.resetModules();
        vi.stubEnv("VITE_WORKFLOW_SCHEMA_BASE_URL", "https://schemas.example.test/Schemas");
        vi.stubGlobal(
            "fetch",
            vi.fn(async () => new Response(JSON.stringify(propertySchema))),
        );
    });
    afterEach(() => {
        vi.unstubAllGlobals();
        vi.unstubAllEnvs();
    });
    it("removes user settings while keeping common fields and requiredness", async () => {
        expect(
            await switchKind(
                {
                    type: "User!",
                    allowsExternalUsers: true,
                    text: "Supervisor",
                    description: "Who supervises",
                    condition: "Always",
                    linkedTo: "Other",
                },
                "TextField",
            ),
        ).toEqual({
            name: "Value",
            type: "String!",
            text: "Supervisor",
            description: "Who supervises",
            condition: "Always",
            linkedTo: "Other",
        });
    });

    it("clears a text variant when changing email to ordinary text", async () => {
        expect(await switchKind({type: "String", variant: "Email"}, "TextField")).toEqual({
            name: "Value",
            type: "String",
        });
    });

    it("sets the requested text variant without keeping multiline settings", async () => {
        expect(
            await switchKind({type: "String", multiline: true, allowAttachments: true}, "Phone"),
        ).toEqual({
            name: "Value",
            type: "String",
            variant: "Phone",
        });
    });

    it("removes flattened text settings when changing text to a date", async () => {
        expect(
            await switchKind(
                {type: "String", multiline: true, allowAttachments: true, variant: "Email"},
                "Date",
            ),
        ).toEqual({
            name: "Value",
            type: "Date",
        });
    });

    it("removes upload settings when changing a file to a date", async () => {
        expect(
            await switchKind(
                {
                    type: "File",
                    prefix: "archive_",
                    allowedTypes: ["zip"],
                    maximumSize: 1000,
                },
                "Date",
            ),
        ).toEqual({name: "Value", type: "Date"});
    });

    it("removes calculations when changing a number to text", async () => {
        expect(await switchKind({type: "Double", calculation: {weight: 2}}, "TextField")).toEqual({
            name: "Value",
            type: "String",
        });
    });

    it("keeps calculations but removes choice settings when changing a choice to a number", async () => {
        expect(
            await switchKind(
                {
                    type: "Value",
                    values: [{name: "Pass"}],
                    rubric: [{name: "Grade", grades: ["Pass"]}],
                    layout: "Rubric",
                    calculation: {weight: 2},
                },
                "Number",
            ),
        ).toEqual({name: "Value", type: "Int", calculation: {weight: 2}});
    });

    it("keeps choices, rubric and calculations when changing between choice kinds", async () => {
        const settings = {
            values: [{name: "Pass"}],
            rubric: [{name: "Grade", grades: ["Pass"]}],
            calculation: {weight: 2},
        };
        expect(await switchKind({type: "Value!", ...settings}, "MultipleChoice")).toEqual({
            name: "Value",
            type: "[Value]!",
            ...settings,
        });
    });

    it("keeps external user settings when changing from one user to multiple users", async () => {
        expect(await switchKind({type: "User", allowsExternalUsers: true}, "People")).toEqual({
            name: "Value",
            type: "[User]",
            allowsExternalUsers: true,
        });
    });

    it("removes reference-only settings when changing a reference to text", async () => {
        expect(
            await switchKind(
                {
                    type: "Context",
                    inheritedRoles: ["Coordinator"],
                    filter: "Active",
                    layout: "RadioList",
                },
                "TextField",
            ),
        ).toEqual({name: "Value", type: "String"});
    });

    it("uses the choice branch when switching a reference to a choice", async () => {
        const result = await switchKind({type: "Context", filter: "Active"}, "SingleChoice");
        expect(result).not.toHaveProperty("filter");
        expect(result).toHaveProperty("values");
    });

    it("leaves the question unchanged when its schema cannot be loaded", async () => {
        vi.stubGlobal(
            "fetch",
            vi.fn(async () => new Response(null, {status: 404})),
        );
        const {changeQuestionKind} = await import("../questions");
        const doc = new Document({
            properties: [{name: "Value", type: "User", allowsExternalUsers: true}],
        });
        const before = doc.toString();
        await expect(
            changeQuestionKind(new Map([[ENTITY_PATH, doc]]), FORM_PATH, "Value", "TextField"),
        ).rejects.toThrow("schema");
        expect(doc.toString()).toBe(before);
    });
});
