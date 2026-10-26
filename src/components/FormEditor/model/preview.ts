import {parseTypeString} from "~/components/FormEditor/model/questionTypes";
import type {ConfigDocs, EditorQuestion} from "~/components/FormEditor/model/types";
import type {Choice, ChoiceQuestion, Question, QuestionBase} from "~/store/api/types/submissions";

/**
 * Exactly the types InputControl branches on. Anything else - File, Currency, Table, Reference,
 * Object, DateTime - falls through to its "Not supported type..." string, so the editor shows its own
 * "no preview" note instead of leaking that.
 */
const SCALAR_TYPES = ["String", "Int", "Double", "Date", "Check", "User"] as const;

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
 * The preview accepts partially edited YAML. Drop fields of the wrong shape before passing them to
 * runtime controls that expect well-formed data.
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
    const type = choices.length > 0 ? "Choice" : (scalar ?? null);
    if (type === null) {
        return null;
    }

    const common: QuestionBase = {
        name: question.name,
        text: question.text,
        description: question.description,
        isRequired,
        isArray,
        hideInResults: raw.hideInResults === true,
    };

    switch (type) {
        case "String":
            return {
                ...common,
                type,
                control:
                    raw.control === "TextArea" || raw.control === "Email" || raw.control === "Phone"
                        ? raw.control
                        : undefined,
                maxLength: typeof raw.maxLength === "number" ? raw.maxLength : undefined,
                minLength: typeof raw.minLength === "number" ? raw.minLength : undefined,
            };
        case "Choice":
            return {
                ...common,
                type,
                choices,
                weight: null,
                percentage: null,
                rubric: Array.isArray(raw.rubric)
                    ? (raw.rubric as ChoiceQuestion["rubric"])
                    : undefined,
                control:
                    typeof raw.control === "string"
                        ? (raw.control as ChoiceQuestion["control"])
                        : undefined,
                sorting: asObject(raw.sorting) as ChoiceQuestion["sorting"],
            };
        case "User":
            return {...common, type, allowsExternalUsers: raw.allowsExternalUsers === true};
        case "Int":
        case "Double":
            return {...common, type, weight: null, percentage: null};
        default:
            return {...common, type};
    }
}
