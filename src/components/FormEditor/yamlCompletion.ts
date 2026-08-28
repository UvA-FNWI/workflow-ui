import type {CompletionContext, CompletionResult, CompletionSource} from "@codemirror/autocomplete";

import {
    type JsonSchema,
    keyCompletions,
    valueCompletions,
} from "~/components/FormEditor/model/schema";

export type SchemaTarget = {root: JsonSchema; start: JsonSchema};

export type CursorContext = {
    /** Keys from the document root down to the mapping the cursor sits in. */
    path: string[];
    /** The key whose value is being typed, or null when the key itself is being typed. */
    key: string | null;
    /** The partial word under the cursor. */
    token: string;
    /** Document offset where that word starts. */
    from: number;
};

const KEY_LINE = /^(\s*)(-\s+)?([\w-]+)\s*:/;
const TYPING_VALUE = /^(\s*)(-\s+)?([\w-]+)\s*:[ \t]+([\w-]*)$/;
const TYPING_KEY = /^(\s*)(-\s+)?([\w-]*)$/;

/** Where a line's content starts, counting the "- " of a sequence item as indentation. */
function contentIndent(line: string): number {
    const match = /^(\s*)(-\s+)?/.exec(line);
    return (match?.[1]?.length ?? 0) + (match?.[2]?.length ?? 0);
}

/** The enclosing keys of a line, found by scanning back for the first shallower key line. */
function parentsOf(lines: string[], index: number, indent: number): string[] {
    const path: string[] = [];
    let target = indent;
    for (let i = index - 1; i >= 0 && target > 0; i--) {
        const line = lines[i];
        if (!line.trim() || line.trimStart().startsWith("#")) {
            continue;
        }
        const lineIndent = contentIndent(line);
        if (lineIndent >= target) {
            continue;
        }
        const key = KEY_LINE.exec(line)?.[3];
        if (key) {
            path.unshift(key);
        }
        target = lineIndent;
    }
    return path;
}

/**
 * Read the cursor position straight off the text rather than off a parsed document: completion has to
 * work while a key is half-typed, which is exactly when the yaml does not parse.
 */
export function cursorContext(text: string, pos: number): CursorContext | null {
    const lines = text.split("\n");
    let lineStart = 0;
    let index = 0;
    for (; index < lines.length - 1; index++) {
        if (lineStart + lines[index].length >= pos) {
            break;
        }
        lineStart += lines[index].length + 1;
    }

    const line = lines[index] ?? "";
    const column = pos - lineStart;
    const before = line.slice(0, column);
    // Completing into the middle of a line would splice text in the wrong place.
    if (line.slice(column).trim() !== "") {
        return null;
    }

    const value = TYPING_VALUE.exec(before);
    if (value) {
        const token = value[4];
        return {
            path: parentsOf(lines, index, contentIndent(line)),
            key: value[3],
            token,
            from: pos - token.length,
        };
    }

    const key = TYPING_KEY.exec(before);
    if (key) {
        const token = key[3];
        return {
            path: parentsOf(lines, index, contentIndent(line)),
            key: null,
            token,
            from: pos - token.length,
        };
    }
    return null;
}

/**
 * Schema-driven completion. The target is read lazily so the editor can mount before the schema
 * finishes downloading; until then this simply offers nothing.
 */
export function schemaCompletion(getTarget: () => SchemaTarget | null): CompletionSource {
    return (context: CompletionContext): CompletionResult | null => {
        const target = getTarget();
        if (!target) {
            return null;
        }
        const cursor = cursorContext(context.state.doc.toString(), context.pos);
        if (!cursor || (!context.explicit && cursor.token === "")) {
            return null;
        }

        const options =
            cursor.key === null
                ? keyCompletions(target.root, target.start, cursor.path).map((option) => ({
                      ...option,
                      type: "property",
                      apply: `${option.label}: `,
                  }))
                : valueCompletions(target.root, target.start, cursor.path, cursor.key).map(
                      (option) => ({...option, type: "enum"}),
                  );

        return options.length === 0 ? null : {from: cursor.from, options, validFor: /^[\w-]*$/};
    };
}
