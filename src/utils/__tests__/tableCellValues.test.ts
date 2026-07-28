import {describe, expect, it} from "vitest";

import {getComparableTableCellValue} from "~/utils/tableCellValues";

describe("getComparableTableCellValue", () => {
    it("uses the requested language when sorting localized object values", () => {
        const progress = {
            text: {
                en: "Waiting for approval",
                nl: "Wacht op goedkeuring",
            },
            color: "Red",
        };

        expect(getComparableTableCellValue(progress, "Object", "en")).toBe("waiting for approval");
        expect(getComparableTableCellValue(progress, "Object", "nl")).toBe("wacht op goedkeuring");
    });

    it("sorts empty values as an empty string", () => {
        expect(getComparableTableCellValue(null, "String", "en")).toBe("");
    });

    it("ignores capitalization when comparing text", () => {
        expect(getComparableTableCellValue("Supervisor", "String", "en")).toBe(
            getComparableTableCellValue("supervisor", "String", "en"),
        );
    });
});
