import {describe, expect, it} from "vitest";

import type {PersonalInstance} from "~/store/api/types/personal";
import {groupPersonalInstancesByRole} from "~/utils/personalInstances";

const instance = (
    id: string,
    roles: string[],
    workflowDefinition = "Project",
): PersonalInstance => ({
    id,
    workflowDefinition,
    workflowDefinitionTitle: {en: workflowDefinition, nl: workflowDefinition},
    title: `Instance ${id}`,
    currentStep: "Start",
    progress: {
        text: {en: "In progress", nl: "In behandeling"},
        color: "Green",
    },
    createdOn: "2026-07-27T12:00:00Z",
    roles,
    student: "Student Name",
    course: "Software Engineering",
    employees: ["Employee Name"],
});

describe("groupPersonalInstancesByRole", () => {
    it("places instances in a separate group for every matching role", () => {
        const studentAndSupervisor = instance("one", ["Student", "Supervisor"]);
        const student = instance("two", ["Student"]);

        const groups = groupPersonalInstancesByRole([studentAndSupervisor, student]);

        expect(groups).toEqual([
            {
                role: "Student",
                instances: [studentAndSupervisor, student],
            },
            {
                role: "Supervisor",
                instances: [studentAndSupervisor],
            },
        ]);
    });

    it("returns no groups when there are no personal instances", () => {
        expect(groupPersonalInstancesByRole([])).toEqual([]);
    });
});
