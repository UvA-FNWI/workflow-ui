import {describe, expect, it} from "vitest";

import {buildOverviewEntries, primaryRegisterScreen} from "../overviewEntries";
import type {WorkflowDefinition} from "~/store/api/types/workflowDefinitions";

const l = (value?: {en?: string} | null) => value?.en ?? "";

const definition = (
    name: string,
    screens: WorkflowDefinition["screens"],
    overrides: Partial<WorkflowDefinition> = {},
): WorkflowDefinition => ({
    name,
    title: {en: `${name} title`, nl: `${name} title`},
    titlePlural: {en: `${name} plural`, nl: `${name} plural`},
    description: {en: `${name} description`, nl: `${name} description`},
    icon: {type: "shield-check-line", color: "Green"},
    index: 1,
    isAlwaysVisible: true,
    inheritsFrom: null,
    isEmbedded: false,
    isPropertyOnly: false,
    canCreateInstance: true,
    screens,
    ...overrides,
});

describe("buildOverviewEntries", () => {
    it("sorts by workflow and screen index, then title", () => {
        const entries = buildOverviewEntries(
            [
                definition("Beta", [
                    {name: "Second", title: {en: "Beta B", nl: "Beta B"}, index: 2},
                    {name: "First", title: {en: "Beta A", nl: "Beta A"}, index: 1},
                ]),
                definition(
                    "Alpha",
                    [{name: "Main", title: {en: "Alpha main", nl: "Alpha main"}, index: 0}],
                    {index: 0},
                ),
            ],
            l,
        );

        expect(entries.map((entry) => entry.key)).toEqual([
            "Alpha/Main",
            "Beta/First",
            "Beta/Second",
        ]);
        expect(entries[0]).toMatchObject({
            workflowDefinition: "Alpha",
            screenName: "Main",
            iconName: "shield-check-line",
        });
    });

    it("uses screen title and workflow description for labels", () => {
        const entries = buildOverviewEntries(
            [
                definition("Catalog", [
                    {
                        name: "Items",
                        title: {en: "Items", nl: "Items"},
                        description: {en: "All items", nl: "All items"},
                    },
                ]),
            ],
            l,
        );

        expect(entries[0]).toMatchObject({
            title: "Items",
            subtitle: "All items",
        });
    });
});

describe("primaryRegisterScreen", () => {
    it("picks the lowest-index screen", () => {
        const screen = primaryRegisterScreen(
            definition("Catalog", [
                {name: "Archive", title: {en: "Archive", nl: "Archive"}, index: 2},
                {name: "Items", title: {en: "Items", nl: "Items"}, index: 1},
            ]),
        );

        expect(screen?.name).toBe("Items");
    });
});
