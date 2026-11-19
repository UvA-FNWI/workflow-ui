import {describe, expect, it} from "vitest";

import {
    filterScreenRows,
    getFiltersByType,
    stripDates,
} from "~/components/ScreenTable/filterScreenRows";
import type {ScreenColumn, ScreenRow} from "~/store/api/types/screens";

function column(id: number, overrides: Partial<ScreenColumn> = {}): ScreenColumn {
    return {
        id,
        title: {en: `Column ${id}`, nl: `Kolom ${id}`},
        filterType: "None",
        displayType: "Normal",
        link: false,
        isCurrentStep: false,
        dataType: "String",
        ...overrides,
    };
}

const columns = [
    column(0, {title: {en: "Name", nl: "Naam"}}),
    column(1, {title: {en: "Status", nl: "Status"}, filterType: "Pick"}),
    column(2, {title: {en: "Track", nl: "Track"}, filterType: "Pick"}),
    column(3, {title: {en: "Secret", nl: "Geheim"}, displayType: "ExportOnly"}),
];

const rows: ScreenRow[] = [
    {id: "alice", values: {0: "Alice", 1: "Open", 2: "Physics", 3: "hidden-alice"}},
    {id: "bob", values: {0: "Bob", 1: "Closed", 2: "Physics", 3: "hidden-bob"}},
    {id: "carol", values: {0: "Carol", 1: "Open", 2: "Chemistry", 3: "hidden-carol"}},
    {id: "dave", values: {0: "Dave", 1: "", 2: "Chemistry", 3: "hidden-dave"}},
];

const ids = (result: ScreenRow[]) => result.map((row) => row.id);

describe("filterScreenRows", () => {
    it("returns the same rows when there is no search and no active filter", () => {
        expect(filterScreenRows(columns, rows, "  ", {1: []}, "en")).toBe(rows);
    });

    it("matches search case-insensitively and ignores surrounding whitespace", () => {
        expect(ids(filterScreenRows(columns, rows, "  aLiCe ", {}, "en"))).toEqual(["alice"]);
    });

    it("searches across all visible columns", () => {
        expect(ids(filterScreenRows(columns, rows, "chemistry", {}, "en"))).toEqual([
            "carol",
            "dave",
        ]);
    });

    it("does not search export-only columns", () => {
        expect(filterScreenRows(columns, rows, "hidden-alice", {}, "en")).toEqual([]);
    });

    it("combines values within one pick filter with OR", () => {
        expect(ids(filterScreenRows(columns, rows, "", {1: ["Open", "Closed"]}, "en"))).toEqual([
            "alice",
            "bob",
            "carol",
        ]);
    });

    it("combines different pick filters with AND", () => {
        expect(
            ids(filterScreenRows(columns, rows, "", {1: ["Open"], 2: ["Physics"]}, "en")),
        ).toEqual(["alice"]);
    });

    it("combines pick filters and search", () => {
        expect(ids(filterScreenRows(columns, rows, "carol", {1: ["Open"]}, "en"))).toEqual([
            "carol",
        ]);
    });

    it("ignores filter values for columns that are not pick filters", () => {
        expect(ids(filterScreenRows(columns, rows, "", {0: ["Alice"]}, "en"))).toEqual(ids(rows));
    });

    it("matches pick filters on current-step values with dates stripped", () => {
        const stepColumns = [column(0, {filterType: "Pick", isCurrentStep: true})];
        const stepRows: ScreenRow[] = [
            {id: "a", values: {0: "Review (03/09)"}},
            {id: "b", values: {0: "Review 18/12"}},
            {id: "c", values: {0: "Grading (01/01)"}},
        ];
        expect(ids(filterScreenRows(stepColumns, stepRows, "", {0: ["Review"]}, "en"))).toEqual([
            "a",
            "b",
        ]);
    });

    it("searches localized values in the active language", () => {
        const localized = [column(0, {dataType: "Object"})];
        const localizedRows: ScreenRow[] = [
            {id: "alice", values: {0: {text: {en: "Alice", nl: "Andere naam"}}}},
        ];
        expect(ids(filterScreenRows(localized, localizedRows, "andere", {}, "nl"))).toEqual([
            "alice",
        ]);
        expect(filterScreenRows(localized, localizedRows, "andere", {}, "en")).toEqual([]);
    });
});

describe("stable keys across languages", () => {
    const progressColumns = [
        column(0, {filterType: "Pick", isCurrentStep: true, dataType: "Object"}),
    ];
    const progressRows: ScreenRow[] = [
        {
            id: "a",
            values: {
                0: {
                    text: {
                        en: "Working (16/09) on revision of proposal",
                        nl: "Werkt (16/09) aan herziening van voorstel",
                    },
                    color: "Green",
                },
            },
        },
        {
            id: "b",
            values: {
                0: {
                    text: {en: "Waits (09/11) for assessment", nl: "Wacht (09/11) op goedkeuring"},
                    color: "Red",
                },
            },
        },
        {
            id: "c",
            values: {
                0: {
                    text: {en: "Waits (12/12) for assessment", nl: "Wacht (12/12) op goedkeuring"},
                    color: "Green",
                },
            },
        },
    ];

    const options = (language: string) =>
        getFiltersByType(progressColumns, progressRows, language, "Pick")[0].options;

    it("uses the same grouped keys in every language with localized labels", () => {
        expect(options("en")).toEqual([
            {key: "Waits for assessment", label: "Waits for assessment"},
            {key: "Working on revision of proposal", label: "Working on revision of proposal"},
        ]);
        expect(options("nl")).toEqual([
            {key: "Waits for assessment", label: "Wacht op goedkeuring"},
            {key: "Working on revision of proposal", label: "Werkt aan herziening van voorstel"},
        ]);
    });

    it("keeps a selected key working after a language change", () => {
        const filters = {0: ["Waits for assessment"]};
        for (const language of ["en", "nl"]) {
            expect(
                ids(filterScreenRows(progressColumns, progressRows, "", filters, language)),
            ).toEqual(["b", "c"]);
        }
    });
});

describe("getFiltersByType", () => {
    it("builds deduplicated, sorted options and skips empty values", () => {
        expect(getFiltersByType(columns, rows, "en", "Pick")).toEqual([
            {
                name: "1",
                title: columns[1].title,
                options: [
                    {key: "Closed", label: "Closed"},
                    {key: "Open", label: "Open"},
                ],
            },
            {
                name: "2",
                title: columns[2].title,
                options: [
                    {key: "Chemistry", label: "Chemistry"},
                    {key: "Physics", label: "Physics"},
                ],
            },
        ]);
    });

    it("strips dates from current-step options so they group together", () => {
        const stepColumns = [column(0, {filterType: "Pick", isCurrentStep: true})];
        const stepRows: ScreenRow[] = [
            {id: "a", values: {0: "Review (03/09)"}},
            {id: "b", values: {0: "Review 18/12"}},
        ];
        expect(getFiltersByType(stepColumns, stepRows, "en", "Pick")[0].options).toEqual([
            {key: "Review", label: "Review"},
        ]);
    });
});

describe("stripDates", () => {
    it.each([
        ["Review (03/09)", "Review"],
        ["Review ( 3/9 )", "Review"],
        ["Review 18/12", "Review"],
        ["Due 01/02 then 03/04 done", "Due then done"],
        ["No date here", "No date here"],
    ])("strips %s to %s", (input, expected) => {
        expect(stripDates(input)).toBe(expected);
    });
});
