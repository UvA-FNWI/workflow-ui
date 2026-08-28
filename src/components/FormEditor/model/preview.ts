import {parseTypeString} from "~/components/FormEditor/model/questionTypes";
import type {ConfigDocs, EditorQuestion} from "~/components/FormEditor/model/types";
import type {Choice, DataType, Question} from "~/store/api/types/submissions";

/**
 * Exactly the types InputControl branches on. Anything else - File, Currency, Table, Reference,
 * Object, DateTime - falls through to its "Not supported type..." string, so the editor shows its own
 * "no preview" note instead of leaking that.
 */
const SCALAR_TYPES: DataType[] = ["String", "Int", "Double", "Date", "Boolean", "User"];

const asChoices = (values: unknown): Choice[] =>
    Array.isArray(values)
        ? values.flatMap((value) => {
              const choice = value as {name?: unknown; text?: unknown; description?: unknown};
              if (typeof choice?.name !== "string") {
                  return [];
              }
              const text =
                  typeof choice.text === "string"
                      ? {en: choice.text, nl: choice.text}
                      : ((choice.text as Choice["text"]) ?? {en: choice.name, nl: choice.name});
              return [{name: choice.name, text, description: choice.description as Choice["text"]}];
          })
        : [];

/**
 * Half-typed yaml produces shapes the runtime never sees: "layout:" followed by a bare word makes
 * layout a string, and InputControl does `"type" in question.layout`, which throws on one. The preview
 * is the boundary between hand-edited text and components that assume well-formed data, so anything
 * of the wrong shape is dropped here rather than passed on.
 */
const asObject = (value: unknown): undefined | Record<string, unknown> =>
    typeof value === "object" && value !== null && !Array.isArray(value)
        ? (value as Record<string, unknown>)
        : undefined;

/** A type name that is neither a scalar nor inline values may still be a shared set in Common. */
function valueSetChoices(docs: ConfigDocs, typeName: string): Choice[] {
    for (const [path, doc] of docs) {
        if (path.includes("/ValueSets/") && doc.get("name") === typeName) {
            return asChoices(doc.toJSON()?.values);
        }
    }
    return [];
}

/**
 * The question as the runtime would hand it to InputControl, so the editor can show the real control
 * instead of describing it. Returns null when nothing renders, e.g. a Table or a dangling reference.
 */
export function toPreviewQuestion(docs: ConfigDocs, question: EditorQuestion): Question | null {
    if (!question.rawType) {
        return null;
    }
    const {underlying, isArray, isRequired} = parseTypeString(question.rawType);
    const raw = question.raw;

    const inline = asChoices(raw.values);
    const choices = inline.length > 0 ? inline : valueSetChoices(docs, underlying);
    const scalar = SCALAR_TYPES.find((type) => type === underlying);
    const type: DataType | null = choices.length > 0 ? "Choice" : (scalar ?? null);
    if (type === null) {
        return null;
    }

    return {
        name: question.name,
        type,
        text: question.text,
        description: question.description,
        weight: null,
        percentage: null,
        isRequired,
        isArray,
        hideInResults: raw.hideInResults === true,
        allowsExternalUsers: raw.allowsExternalUsers === true,
        choices,
        rubric: Array.isArray(raw.rubric) ? (raw.rubric as Question["rubric"]) : undefined,
        layout: asObject(raw.layout) as Question["layout"],
        maxLength: typeof raw.maxLength === "number" ? raw.maxLength : undefined,
        sorting: asObject(raw.sorting) as Question["sorting"],
    };
}
