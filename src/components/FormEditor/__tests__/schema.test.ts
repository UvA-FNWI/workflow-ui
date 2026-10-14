import {afterEach, beforeEach, describe, expect, it, vi} from "vitest";

import type {SchemaName} from "../model/schema";

const property = {
    properties: {
        layout: {$ref: "#/definitions/Layout"},
        condition: {$ref: "#/definitions/Condition"},
    },
    definitions: {
        Layout: {properties: {variant: {enum: ["Email", "Phone"]}}},
        Condition: {
            properties: {and: {type: "array", items: {$ref: "#/definitions/Condition"}}},
        },
    },
};

describe("shared schema loading", () => {
    beforeEach(() => vi.resetModules());
    afterEach(() => vi.unstubAllGlobals());

    it.each<SchemaName>(["WorkflowDefinition", "Step"])(
        "resolves shared property definitions in %s without colliding with local definitions",
        async (name) => {
            const fetchSchema = vi.fn(
                async (url: string) =>
                    new Response(
                        JSON.stringify(
                            url.endsWith("/PropertyDefinition.json")
                                ? property
                                : {
                                      properties: {
                                          properties: {items: {$ref: "PropertyDefinition.json"}},
                                      },
                                      definitions: {
                                          Layout: {properties: {localKey: {type: "string"}}},
                                      },
                                  },
                        ),
                    ),
            );
            vi.stubGlobal("fetch", fetchSchema);
            const {loadSchema, keyCompletions, valueCompletions} = await import("../model/schema");
            const root = (await loadSchema(name))!;
            expect(
                keyCompletions(root, root, ["properties", "layout"]).map((key) => key.label),
            ).toEqual(["variant"]);
            expect(valueCompletions(root, root, ["properties", "layout"], "variant")).toEqual([
                {label: "Email"},
                {label: "Phone"},
            ]);
            expect(
                keyCompletions(root, root, ["properties", "condition", "and", "and"]).map(
                    (key) => key.label,
                ),
            ).toEqual(["and"]);
            expect(await loadSchema(name)).toBe(root);
            expect(fetchSchema).toHaveBeenCalledTimes(2);
        },
    );

    it("resolves nested file paths and external pointer fragments", async () => {
        const documents: Record<string, unknown> = {
            "Step.json": {
                properties: {layout: {$ref: "types/PropertyDefinition.json#/properties/layout"}},
            },
            "types/PropertyDefinition.json": {
                properties: {layout: {$ref: "../Layout.json#/definitions/Layout"}},
            },
            "Layout.json": {definitions: {Layout: property.definitions.Layout}},
        };
        vi.stubGlobal(
            "fetch",
            vi.fn(
                async (url: string) =>
                    new Response(JSON.stringify(documents[url.split("/Schemas/")[1]])),
            ),
        );
        const {loadSchema, valueCompletions} = await import("../model/schema");
        const root = (await loadSchema("Step"))!;
        expect(valueCompletions(root, root, ["layout"], "variant")).toEqual([
            {label: "Email"},
            {label: "Phone"},
        ]);
    });

    it("loads a standalone property schema", async () => {
        vi.stubGlobal(
            "fetch",
            vi.fn(async () => new Response(JSON.stringify(property))),
        );
        const {loadSchema, keyCompletions} = await import("../model/schema");
        const root = (await loadSchema("PropertyDefinition"))!;
        expect(keyCompletions(root, root, ["layout"]).map((key) => key.label)).toEqual(["variant"]);
    });

    it("disables completion when a referenced schema cannot be loaded", async () => {
        vi.stubGlobal(
            "fetch",
            vi.fn(async (url: string) =>
                url.endsWith("/PropertyDefinition.json")
                    ? new Response(null, {status: 404})
                    : new Response(JSON.stringify({$ref: "PropertyDefinition.json"})),
            ),
        );
        const {loadSchema} = await import("../model/schema");
        expect(await loadSchema("WorkflowDefinition")).toBeNull();
    });
});
