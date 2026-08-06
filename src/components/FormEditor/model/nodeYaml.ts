import {Document, isMap, parseDocument, type YAMLMap} from "yaml";

/**
 * One node's yaml, comments and all. Document#createNode hands an existing node straight back, so
 * wrapping is a view onto the same node rather than a copy, and stringifying it changes nothing.
 */
export function nodeToYaml(node: YAMLMap): string {
    return new Document(node).toString().trimEnd();
}

/**
 * Replace a node's contents from edited text, returning a message on failure. The node object itself
 * survives, so every reference held elsewhere (and the surrounding file, with its comments and key
 * order) stays intact - only this node's own lines change.
 */
export function applyYamlToNode(node: YAMLMap, text: string): string | null {
    const parsed = parseDocument(text);
    if (parsed.errors.length > 0) {
        return parsed.errors[0].message;
    }
    if (!isMap(parsed.contents)) {
        return 'Expected a mapping, for example "type: String"';
    }

    node.items = parsed.contents.items;
    node.comment = parsed.contents.comment ?? null;
    node.commentBefore = parsed.contents.commentBefore ?? null;
    return null;
}
