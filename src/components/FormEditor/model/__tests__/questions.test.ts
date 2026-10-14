import {describe, expect, it} from "vitest";
import {Document} from "yaml";

import {changeQuestionKind} from "../questions";
import type {QuestionKind} from "../types";

const ENTITY_PATH = "Definitions/Thesis/Entity.yaml";
const FORM_PATH = "Definitions/Thesis/Forms/Proposal.yaml";

function switchKind(property: Record<string, unknown>, kind: QuestionKind) {
    const doc = new Document({name: "Thesis", properties: [{name: "Value", ...property}]});
    const docs = new Map([[ENTITY_PATH, doc]]);
    expect(changeQuestionKind(docs, FORM_PATH, "Value", kind)).toEqual([ENTITY_PATH]);
    return doc.toJSON().properties[0];
}

describe("question type switching", () => {
    it("removes user settings while keeping common fields and requiredness", () => {
        expect(
            switchKind(
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

    it("removes upload settings when changing a file to a date", () => {
        expect(
            switchKind(
                {
                    type: "File",
                    fileSettings: {allowedTypes: ["zip"], maximumSize: 1000},
                    allowedFileTypes: ["zip"],
                    allowedFileSize: 1000,
                },
                "Date",
            ),
        ).toEqual({name: "Value", type: "Date"});
    });

    it("removes calculations when changing a number to text", () => {
        expect(switchKind({type: "Double", calculation: {weight: 2}}, "TextField")).toEqual({
            name: "Value",
            type: "String",
        });
    });

    it("keeps calculations but removes choice settings when changing a choice to a number", () => {
        expect(
            switchKind(
                {
                    type: "Value",
                    values: [{name: "Pass"}],
                    rubric: [{name: "Grade", grades: ["Pass"]}],
                    layout: {type: "Rubric"},
                    calculation: {weight: 2},
                },
                "Number",
            ),
        ).toEqual({name: "Value", type: "Int", calculation: {weight: 2}});
    });

    it("keeps choices, rubric and calculations when changing between choice kinds", () => {
        const settings = {
            values: [{name: "Pass"}],
            rubric: [{name: "Grade", grades: ["Pass"]}],
            calculation: {weight: 2},
        };
        expect(switchKind({type: "Value!", ...settings}, "MultipleChoice")).toEqual({
            name: "Value",
            type: "[Value]!",
            ...settings,
        });
    });

    it("keeps external user settings when changing from one user to multiple users", () => {
        expect(switchKind({type: "User", allowsExternalUsers: true}, "People")).toEqual({
            name: "Value",
            type: "[User]",
            allowsExternalUsers: true,
        });
    });

    it("removes reference-only settings when changing a reference to text", () => {
        expect(
            switchKind(
                {
                    type: "Context",
                    inheritedRoles: ["Coordinator"],
                    filter: "Active",
                    layout: {type: "RadioList"},
                },
                "TextField",
            ),
        ).toEqual({name: "Value", type: "String"});
    });
});
