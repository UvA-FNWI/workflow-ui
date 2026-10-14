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
    const originalEnvironment = Reflect.get(window, "_env");
    beforeEach(() => {
        vi.resetModules();
        vi.stubEnv("VITE_WORKFLOW_SCHEMA_BASE_URL", "https://schemas.example.test/Schemas");
    });
    afterEach(() => {
        vi.unstubAllGlobals();
        vi.unstubAllEnvs();
        Reflect.set(window, "_env", originalEnvironment);
    });

    it("loads root and referenced schemas from the runtime API with authentication", async () => {
        vi.stubEnv("VITE_WORKFLOW_SCHEMA_BASE_URL", undefined);
        vi.stubEnv("VITE_WEBAPI_URL", "https://build-api.example.test");
        Reflect.set(window, "_env", {
            VITE_WEBAPI_URL: "https://deployed-api.example.test/workflow/",
        });
        const requests: Request[] = [];
        vi.stubGlobal(
            "fetch",
            vi.fn(async (request: Request) => {
                requests.push(request);
                return new Response(
                    JSON.stringify(
                        request.url.endsWith("/PropertyDefinition.json")
                            ? property
                            : {
                                  properties: {
                                      properties: {items: {$ref: "PropertyDefinition.json"}},
                                  },
                              },
                    ),
                );
            }),
        );
        const {store} = await import("~/store/store");
        const {setAccessToken} = await import("~/store/authSlice");
        store.dispatch(setAccessToken("test-token"));
        const {loadSchema, keyCompletions} = await import("../model/schema");
        const root = (await loadSchema("Step"))!;
        expect(
            keyCompletions(root, root, ["properties", "layout"]).map((key) => key.label),
        ).toEqual(["variant"]);
        const schemas = requests.filter((request) => request.url.includes("/Schemas/"));
        expect(schemas.map((request) => request.url)).toEqual([
            "https://deployed-api.example.test/workflow/Schemas/Step.json",
            "https://deployed-api.example.test/workflow/Schemas/PropertyDefinition.json",
        ]);
        for (const request of schemas) {
            expect(request.headers.get("Authorization")).toBe("Bearer test-token");
        }
    });

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

    it("loads the question schema directly", async () => {
        const fetchSchema = vi.fn(async (url: string) => {
            expect(url).toMatch(/\/PropertyDefinition\.json$/);
            return new Response(JSON.stringify(property));
        });
        vi.stubGlobal("fetch", fetchSchema);
        const {loadSchema, keyCompletions} = await import("../model/schema");
        const root = (await loadSchema("PropertyDefinition"))!;
        expect(keyCompletions(root, root, ["layout"]).map((key) => key.label)).toEqual(["variant"]);
        expect(fetchSchema).toHaveBeenCalledTimes(1);
        expect(fetchSchema).toHaveBeenCalledWith(
            "https://schemas.example.test/Schemas/PropertyDefinition.json",
        );
    });

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
