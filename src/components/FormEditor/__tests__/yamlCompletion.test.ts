import {CompletionContext} from "@codemirror/autocomplete";
import {EditorState} from "@uiw/react-codemirror";
import {describe, expect, it} from "vitest";

import type {JsonSchema} from "../model/schema";
import {schemaCompletion} from "../yamlCompletion";

const primitiveTypes = [
    "Date",
    "Date!",
    "[Date]",
    "[Date]!",
    "File",
    "File!",
    "[File]",
    "[File]!",
    "String",
    "Double",
];
const root: JsonSchema = {
    properties: {properties: {type: "array", items: {$ref: "#/definitions/PropertyDefinition"}}},
    definitions: {
        PropertyDefinition: {
            anyOf: ["Date", "File", "String", "Double", "Choice", "Reference"].map((name) => ({
                $ref: `#/definitions/${name}`,
            })),
        },
        Date: {properties: {name: {type: "string"}, type: {enum: primitiveTypes.slice(0, 4)}}},
        File: {
            properties: {
                name: {type: "string"},
                type: {enum: primitiveTypes.slice(4, 8)},
                fileSettings: {type: "object"},
            },
        },
        String: {
            properties: {
                name: {type: "string"},
                type: {enum: ["String"]},
                layout: {oneOf: [{type: "null"}, {$ref: "#/definitions/TextLayout"}]},
            },
        },
        Choice: {
            properties: {
                name: {type: "string"},
                type: {not: {enum: primitiveTypes}},
                values: {type: "array"},
                calculation: {type: "object"},
            },
        },
        Double: {
            properties: {
                name: {type: "string"},
                type: {enum: ["Double"]},
                calculation: {type: "object"},
            },
        },
        Reference: {
            properties: {
                name: {type: "string"},
                type: {not: {enum: primitiveTypes}},
                filter: {type: "string"},
            },
        },
        TextLayout: {
            properties: {multiline: {type: "boolean"}, variant: {enum: ["Email", "Phone"]}},
        },
    },
};

async function suggestions(markedText: string, start = root.definitions!.PropertyDefinition) {
    const pos = markedText.indexOf("|");
    const text = markedText.replace("|", "");
    const result = await schemaCompletion(() => ({root, start}))(
        new CompletionContext(EditorState.create({doc: text}), pos, true),
    );
    return result?.options.map((option) => option.label) ?? [];
}

describe("typed property schema completion", () => {
    it("offers calculation only for types that support grading", async () => {
        expect(await suggestions("name: Score\ntype: Double\n|")).toContain("calculation");
        expect(await suggestions("name: Grade\ntype: Grade\n|")).toContain("calculation");
        for (const type of ["Date", "File", "String"]) {
            expect(await suggestions(`name: Value\ntype: ${type}\n|`)).not.toContain("calculation");
        }
    });

    it("narrows a question fragment using its quoted array/required type", async () => {
        expect(await suggestions("name: Due\ntype: '[Date]!'\nfi|")).toEqual(["name", "type"]);
        expect(await suggestions("name: Report\ntype: File\n|")).toContain("fileSettings");
    });

    it("selects the property under the cursor in a file with multiple properties", async () => {
        const text =
            "name: Project\nproperties:\n  - name: Report\n    type: File\n  - name: Due\n    type: Date\n    fi|\n  - name: LaterFile\n    type: File\n";
        expect(await suggestions(text, root)).toEqual(["name", "type"]);
    });

    it("narrows nested layout keys and values to the selected text property", async () => {
        expect(await suggestions("name: Notes\ntype: String\nlayout:\n  |")).toEqual([
            "multiline",
            "variant",
        ]);
        expect(await suggestions("name: Notes\ntype: String\nlayout:\n  variant: |")).toEqual([
            "Email",
            "Phone",
        ]);
    });

    it("keeps named choice/reference alternatives without offering file settings", async () => {
        const options = await suggestions("name: Country\ntype: Country\n|");
        expect(options).toContain("values");
        expect(options).toContain("filter");
        expect(options).not.toContain("fileSettings");
    });

    it("keeps every type suggestion when many variants share common fields", async () => {
        const names = [
            "String",
            "Date",
            "DateTime",
            "Int",
            "Double",
            "Check",
            "Currency",
            "File",
            "User",
        ];
        const schema: JsonSchema = {
            anyOf: names.map((name) => ({properties: {type: {enum: [name]}}})),
        };
        const result = await schemaCompletion(() => ({root: schema, start: schema}))(
            new CompletionContext(EditorState.create({doc: "type: "}), 6, true),
        );
        expect(result?.options.map((option) => option.label)).toEqual(names);
    });

    it("offers all alternatives before a type is entered", async () => {
        expect(await suggestions("name: Value\n|")).toContain("fileSettings");
    });
});
