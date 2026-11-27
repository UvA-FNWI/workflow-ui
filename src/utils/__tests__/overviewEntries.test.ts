import {describe, expect, it} from "vitest";

import {buildOverviewEntries, primaryRegisterScreen} from "../overviewEntries";
import type {WorkflowDefinition, WorkflowScreen} from "~/store/api/types/workflowDefinitions";

const l = (value?: {en?: string} | null) => value?.en ?? "";

const makeScreen = (name: string, overrides: Partial<WorkflowScreen> = {}): WorkflowScreen => ({
    name,
    title: {en: name, nl: name},
    description: null,
    index: 0,
    ...overrides,
});

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
    properties: [],
    screens,
    ...overrides,
});

describe("buildOverviewEntries", () => {
    it("sorts by workflow and screen index, then title", () => {
        const entries = buildOverviewEntries(
            [
                definition("Beta", [
                    makeScreen("Second", {title: {en: "Beta B", nl: "Beta B"}, index: 2}),
                    makeScreen("First", {title: {en: "Beta A", nl: "Beta A"}, index: 1}),
                ]),
                definition(
                    "Alpha",
                    [makeScreen("Main", {title: {en: "Alpha main", nl: "Alpha main"}})],
                    {
                        index: 0,
                    },
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

    it("uses workflow title and description like the coordinator home list", () => {
        const entries = buildOverviewEntries(
            [
                definition("Catalog", [
                    makeScreen("Items", {
                        title: {en: "Items", nl: "Items"},
                        description: {en: "All items", nl: "All items"},
                    }),
                ]),
            ],
            l,
        );

        expect(entries[0]).toMatchObject({
            title: "Catalog title",
            subtitle: "Catalog description",
        });
    });

    it("falls back to titlePlural when there is no workflow description", () => {
        const entries = buildOverviewEntries(
            [
                definition("RMSS", [makeScreen("Projects", {title: null, description: null})], {
                    title: {
                        en: "Research Master Social Sciences",
                        nl: "Research Master Social Sciences",
                    },
                    titlePlural: {en: "Projecten (RMSS)", nl: "Projecten (RMSS)"},
                    description: null,
                }),
            ],
            l,
        );

        expect(entries[0]).toMatchObject({
            title: "Research Master Social Sciences",
            subtitle: "Projecten (RMSS)",
        });
    });
});

describe("primaryRegisterScreen", () => {
    it("picks the lowest-index screen", () => {
        const screen = primaryRegisterScreen(
            definition("Catalog", [
                makeScreen("Archive", {title: {en: "Archive", nl: "Archive"}, index: 2}),
                makeScreen("Items", {title: {en: "Items", nl: "Items"}, index: 1}),
            ]),
        );

        expect(screen?.name).toBe("Items");
    });
});
