/**
 * JSON Schema plumbing for the yaml editors, using the schemas the C# model generates into
 * workflow-api/Schemas. They are fetched from the same raw GitHub URLs that workflow-dev points VS
 * Code at, so the browser editor and the extension offer the same keys.
 *
 * Pinned to main, because nothing serves these at runtime. Point BASE at the API instead once
 * workflow-api exposes them, so completion matches the version being edited.
 */

export type JsonSchema = {
    $ref?: string;
    type?: string | string[];
    description?: string;
    enum?: unknown[];
    properties?: Record<string, JsonSchema>;
    definitions?: Record<string, JsonSchema>;
    items?: JsonSchema;
    oneOf?: JsonSchema[];
    anyOf?: JsonSchema[];
    allOf?: JsonSchema[];
    not?: JsonSchema;
};

const BASE = "https://raw.githubusercontent.com/UvA-FNWI/workflow-api/refs/heads/main/Schemas";

export type SchemaName = "WorkflowDefinition" | "Form" | "Step" | "Role" | "Screen" | "ValueSet";

/** The same globs as the yaml.schemas block in workflow-dev/package.json. */
export function schemaNameForPath(path: string): SchemaName | null {
    const candidate = `/${path}`;
    if (/\/Forms\/[^/]+\.yaml$/i.test(candidate)) return "Form";
    if (/\/Steps\/[^/]+\.yaml$/i.test(candidate)) return "Step";
    if (/\/Roles\/[^/]+\.yaml$/i.test(candidate)) return "Role";
    if (/\/Screens\/[^/]+\.yaml$/i.test(candidate)) return "Screen";
    if (/\/ValueSets\/[^/]+\.yaml$/i.test(candidate)) return "ValueSet";
    if (/\/(Entity|Properties|Actions)\.yaml$/i.test(candidate)) return "WorkflowDefinition";
    return null;
}

const cache = new Map<string, Promise<JsonSchema | null>>();

/** Fetched once per schema. A failure resolves to null, which just means no completion. */
export function loadSchema(name: SchemaName): Promise<JsonSchema | null> {
    let pending = cache.get(name);
    if (!pending) {
        pending = fetch(`${BASE}/${name}.json`)
            .then((response) => (response.ok ? (response.json() as Promise<JsonSchema>) : null))
            .catch(() => null);
        cache.set(name, pending);
    }
    return pending;
}

export function resolvePointer(root: JsonSchema, pointer: string): JsonSchema {
    return pointer
        .replace(/^#\//, "")
        .split("/")
        .filter(Boolean)
        .reduce<JsonSchema>(
            (node, key) => (node as unknown as Record<string, JsonSchema>)?.[key] ?? {},
            root,
        );
}

const MAX_DEPTH = 8;

/**
 * Collapse one schema node into a single object with usable properties. NJsonSchema writes
 * nullability as oneOf [null, X] and polymorphic fields (layout) as oneOf of several refs, so
 * branches are selected by the mapping's type when known, or merged while the type is unset. Recursion is
 * capped because Condition refers back to itself through Logical.
 */
export function flatten(
    schema: JsonSchema | undefined,
    root: JsonSchema,
    depth = 0,
    value?: unknown,
): JsonSchema {
    if (!schema || depth > MAX_DEPTH) {
        return {};
    }
    const node = schema.$ref
        ? flatten(resolvePointer(root, schema.$ref), root, depth + 1, value)
        : schema;
    const branches = node.oneOf ?? node.anyOf ?? node.allOf;
    if (!branches) {
        return node;
    }

    const merged: JsonSchema = {...node, properties: {...node.properties}};
    delete merged.oneOf;
    delete merged.anyOf;
    delete merged.allOf;
    const type = value && typeof value === "object" ? (value as {type?: unknown}).type : undefined;
    for (const branch of branches) {
        const variant = branch.$ref ? resolvePointer(root, branch.$ref) : branch;
        const typeConstraint = variant.properties?.type;
        if (
            typeof type === "string" &&
            typeConstraint &&
            ((typeConstraint.enum && !typeConstraint.enum.includes(type)) ||
                typeConstraint.not?.enum?.includes(type))
        ) {
            continue;
        }
        const resolved = flatten(branch, root, depth + 1, value);
        if (resolved.type === "null") {
            continue;
        }
        for (const [key, value] of Object.entries(resolved.properties ?? {})) {
            // Branches can define the same key differently: layout.type is one enum for a choice and
            // another for a table. Keep both as a union so completion offers every legal value.
            const existing = merged.properties![key];
            merged.properties![key] = existing
                ? {anyOf: [...(existing.anyOf ?? [existing]), value]}
                : value;
        }
        merged.type ??= resolved.type;
        merged.items ??= resolved.items;
        merged.enum = resolved.enum ? [...(merged.enum ?? []), ...resolved.enum] : merged.enum;
    }
    return merged;
}

/** Arrays are transparent: a key under `properties:` belongs to the item, not to the list. */
function intoItems(schema: JsonSchema, root: JsonSchema, value?: unknown): JsonSchema {
    return schema.items ? flatten(schema.items, root, 0, value) : schema;
}

type ValueAt = (path: string[]) => unknown;

/** Walk a key path down from a starting schema, returning {} when the path leaves the schema. */
export function schemaAt(
    root: JsonSchema,
    start: JsonSchema,
    path: string[],
    valueAt?: ValueAt,
): JsonSchema {
    let current = flatten(start, root, 0, valueAt?.([]));
    const prefix: string[] = [];
    for (const key of path) {
        const next = intoItems(current, root, valueAt?.(prefix)).properties?.[key];
        if (!next) {
            return {};
        }
        prefix.push(key);
        current = flatten(next, root, 0, valueAt?.(prefix));
    }
    return current;
}

export type SchemaCompletion = {label: string; detail?: string; info?: string};

export function keyCompletions(
    root: JsonSchema,
    start: JsonSchema,
    path: string[],
    valueAt?: ValueAt,
): SchemaCompletion[] {
    const node = intoItems(schemaAt(root, start, path, valueAt), root, valueAt?.(path));
    return Object.entries(node.properties ?? {}).map(([label, definition]) => {
        const resolved = flatten(definition, root);
        return {
            label,
            detail: Array.isArray(resolved.type) ? resolved.type.join(" | ") : resolved.type,
            info: definition.description ?? resolved.description,
        };
    });
}

export function valueCompletions(
    root: JsonSchema,
    start: JsonSchema,
    path: string[],
    key: string,
    valueAt?: ValueAt,
): SchemaCompletion[] {
    const parent = intoItems(schemaAt(root, start, path, valueAt), root, valueAt?.(path));
    const node = flatten(parent.properties?.[key], root);
    if (node.enum?.length) {
        return [...new Set(node.enum.map(String))].map((label) => ({label}));
    }
    return node.type === "boolean" ? [{label: "true"}, {label: "false"}] : [];
}
