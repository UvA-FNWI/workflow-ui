import {describe, expect, it} from "vitest";

import {
    EMPTY_FILTER_KEY,
    filterScreenRows,
    getFiltersByType,
} from "~/components/ScreenTable/filterScreenRows";
import type {ScreenColumn, ScreenRow} from "~/store/api/types/screens";

function column(id: number, overrides: Partial<ScreenColumn> = {}): ScreenColumn {
    return {
        id,
        title: {en: `Column ${id}`, nl: `Kolom ${id}`},
        filterType: "None",
        displayType: "Normal",
        link: false,
        columnType: "Normal",
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
        column(0, {filterType: "Pick", columnType: "CurrentStep", dataType: "Object"}),
    ];
    const progressRows: ScreenRow[] = [
        {
            id: "a",
            values: {
                0: {
                    text: {
                        en: "Working on revision of proposal",
                        nl: "Werkt aan herziening van voorstel",
                    },
                    color: "Green",
                },
            },
        },
        {
            id: "b",
            values: {
                0: {
                    text: {en: "Waits for assessment", nl: "Wacht op goedkeuring"},
                    color: "Red",
                },
            },
        },
        {
            id: "c",
            values: {
                0: {
                    text: {en: "Waits for assessment", nl: "Wacht op goedkeuring"},
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
    it("builds deduplicated, sorted options with the empty option last", () => {
        expect(getFiltersByType(columns, rows, "en", "Pick")).toEqual([
            {
                name: "1",
                title: columns[1].title,
                options: [
                    {key: "Closed", label: "Closed"},
                    {key: "Open", label: "Open"},
                    {key: EMPTY_FILTER_KEY, label: "—"},
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

    it("filters rows with an empty value via the empty key", () => {
        expect(ids(filterScreenRows(columns, rows, "", {1: [EMPTY_FILTER_KEY]}, "en"))).toEqual([
            "dave",
        ]);
    });

    it("trims whitespace from keys", () => {
        const trimRows: ScreenRow[] = [{id: "a", values: {1: "  Open  "}}];
        expect(getFiltersByType([columns[1]], trimRows, "en", "Pick")[0].options).toEqual([
            {key: "Open", label: "Open"},
        ]);
    });

    it("does not throw on localized objects without an en value", () => {
        const localized = [column(0, {filterType: "Pick", dataType: "Object"})];
        const localizedRows: ScreenRow[] = [{id: "a", values: {0: {nl: "Alleen Nederlands"}}}];
        expect(() => getFiltersByType(localized, localizedRows, "en", "Pick")).not.toThrow();
    });
});

describe("related users", () => {
    const userColumns = [
        column(0, {filterType: "Pick", columnType: "RelatedUsers", dataType: "Object"}),
    ];
    const userRows: ScreenRow[] = [
        {
            id: "a",
            values: {0: [{displayName: "Alice Smith", userName: "asmith"}, {userName: "bob"}]},
        },
        {id: "b", values: {0: [{displayName: "Alice Smith"}]}},
        {id: "c", values: {0: []}},
        {id: "d", values: {0: [null, {displayName: "   "}]}},
        {id: "e", values: {0: [{displayName: "  ", userName: "carol"}]}},
    ];

    it("uses displayName, falls back to userName, and adds the empty option last", () => {
        expect(getFiltersByType(userColumns, userRows, "en", "Pick")[0].options).toEqual([
            {key: "Alice Smith", label: "Alice Smith"},
            {key: "bob", label: "bob"},
            {key: "carol", label: "carol"},
            {key: EMPTY_FILTER_KEY, label: "—"},
        ]);
    });

    it("falls back to userName when displayName is blank", () => {
        expect(ids(filterScreenRows(userColumns, userRows, "", {0: ["carol"]}, "en"))).toEqual([
            "e",
        ]);
    });

    it("matches a row when any of its users is selected", () => {
        expect(
            ids(filterScreenRows(userColumns, userRows, "", {0: ["Alice Smith"]}, "en")),
        ).toEqual(["a", "b"]);
        expect(ids(filterScreenRows(userColumns, userRows, "", {0: ["bob"]}, "en"))).toEqual(["a"]);
    });

    it("treats empty arrays, null users and blank names as empty", () => {
        expect(
            ids(filterScreenRows(userColumns, userRows, "", {0: [EMPTY_FILTER_KEY]}, "en")),
        ).toEqual(["c", "d"]);
    });
});

describe("generic array values", () => {
    const tagColumns = [column(0, {filterType: "Pick"})];
    const tagRows: ScreenRow[] = [
        {id: "a", values: {0: ["Physics", " Chemistry "]}},
        {id: "b", values: {0: ["Physics"]}},
    ];

    it("creates one trimmed option per item", () => {
        expect(getFiltersByType(tagColumns, tagRows, "en", "Pick")[0].options).toEqual([
            {key: "Chemistry", label: "Chemistry"},
            {key: "Physics", label: "Physics"},
        ]);
    });

    it("matches a row when any item is selected", () => {
        expect(ids(filterScreenRows(tagColumns, tagRows, "", {0: ["Chemistry"]}, "en"))).toEqual([
            "a",
        ]);
    });
});
