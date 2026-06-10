import type {LocalString} from "~/hooks/useTranslate";
import type {Choice, Sorting} from "~/store/api/types/submissions";

/**
 * Sorts choices according to the value set's sorting configuration.
 *
 * Localized fields (text, description) are sorted by their value in the active
 * language, so e.g. the country selector is alphabetical in both Dutch and English.
 * When no sorting is configured the original (yaml) order is preserved.
 */
export function sortChoices(
    choices: Choice[],
    sorting: Sorting | undefined,
    language: string,
): Choice[] {
    if (!sorting) return choices;

    const localize = (text?: LocalString) => (language === "nl" ? text?.nl : text?.en) ?? "";

    const getValue = (choice: Choice): string | number => {
        switch (sorting.field) {
            case "Name":
                return choice.name;
            case "Text":
                return localize(choice.text);
            case "Description":
                return localize(choice.description);
            case "Value":
                return choice.value ?? 0;
        }
    };

    const factor = sorting.direction === "Descending" ? -1 : 1;
    const collator = new Intl.Collator(language);

    return [...choices].sort((a, b) => {
        const left = getValue(a);
        const right = getValue(b);
        const comparison =
            typeof left === "number" && typeof right === "number"
                ? left - right
                : collator.compare(String(left), String(right));
        return comparison * factor;
    });
}
