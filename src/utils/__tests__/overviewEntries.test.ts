import {describe, expect, it} from "vitest";

import {
    buildOverviewEntries,
    groupOverviewEntries,
    primaryRegisterScreen,
} from "../overviewEntries";
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
                definition("Application", [
                    {
                        name: "Subjects",
                        title: {en: "Subjects", nl: "Onderwerpen"},
                        description: {en: "All subjects", nl: "Alle onderwerpen"},
                    },
                ]),
            ],
            l,
        );

        expect(entries[0]).toMatchObject({
            title: "Subjects",
            subtitle: "All subjects",
        });
    });
});

describe("groupOverviewEntries", () => {
    it("buckets registers into general, security, and privacy sections", () => {
        const entries = buildOverviewEntries(
            [
                definition(
                    "Application",
                    [
                        {name: "Applications", title: {en: "Subjects", nl: "Subjects"}, index: 1},
                        {name: "RoPA", title: {en: "RoPA", nl: "RoPA"}, index: 2},
                        {name: "Measures", title: {en: "Measures", nl: "Measures"}, index: 3},
                    ],
                    {index: 1},
                ),
                definition(
                    "DpiaAssessment",
                    [{name: "Dpias", title: {en: "DPIAs", nl: "DPIAs"}, index: 0}],
                    {index: 2},
                ),
                definition(
                    "DtiaAssessment",
                    [{name: "DTIAs", title: {en: "DTIAs", nl: "DTIAs"}, index: 0}],
                    {index: 5},
                ),
            ],
            l,
        );

        const groups = groupOverviewEntries(entries);

        expect(groups.map((group) => group.id)).toEqual(["general", "security", "privacy"]);
        expect(groups[0]?.entries.map((entry) => entry.key)).toEqual(["Application/Applications"]);
        expect(groups[1]?.entries.map((entry) => entry.key)).toEqual(["Application/Measures"]);
        expect(groups[2]?.entries.map((entry) => entry.key)).toEqual([
            "Application/RoPA",
            "DpiaAssessment/Dpias",
            "DtiaAssessment/DTIAs",
        ]);
    });
});

describe("primaryRegisterScreen", () => {
    it("picks the lowest-index screen", () => {
        const screen = primaryRegisterScreen(
            definition("Application", [
                {name: "RoPA", title: {en: "RoPA", nl: "RoPA"}, index: 2},
                {name: "Applications", title: {en: "Subjects", nl: "Subjects"}, index: 1},
            ]),
        );

        expect(screen?.name).toBe("Applications");
    });
});
