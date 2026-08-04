import {describe, expect, it} from "vitest";

import type {PersonalInstance, PersonalRole} from "~/store/api/types/personal";
import {
    groupPersonalInstancesByRole,
    partitionPersonalInstancesByCompletion,
} from "~/utils/personalInstances";

const instance = (
    id: string,
    roles: string[],
    workflowDefinition = "Project",
    currentStep: string | null = "Start",
): PersonalInstance => ({
    id,
    workflowDefinition,
    workflowDefinitionTitle: {en: workflowDefinition, nl: workflowDefinition},
    title: `Instance ${id}`,
    currentStep,
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

const role = (name: string, en: string, nl: string): PersonalRole => ({
    name,
    title: {en, nl},
});

describe("groupPersonalInstancesByRole", () => {
    it("places instances in a separate group for every matching role", () => {
        const studentRole = role("Student", "Student", "Student");
        const supervisorRole = role("Supervisor", "Supervisor", "Begeleider");
        const studentAndSupervisor = instance("one", ["Student", "Supervisor"]);
        const student = instance("two", ["Student"]);

        const groups = groupPersonalInstancesByRole(
            [studentAndSupervisor, student],
            [studentRole, supervisorRole],
        );

        expect(groups).toEqual([
            {
                role: studentRole,
                instances: [studentAndSupervisor, student],
            },
            {
                role: supervisorRole,
                instances: [studentAndSupervisor],
            },
        ]);
    });

    it("returns no groups when there are no personal instances", () => {
        expect(groupPersonalInstancesByRole([], [role("Student", "Student", "Student")])).toEqual(
            [],
        );
    });

    it("matches role names case-insensitively", () => {
        const studentRole = role("Student", "Student", "Student");
        const student = instance("student", ["student"]);

        expect(groupPersonalInstancesByRole([student], [studentRole])).toEqual([
            {role: studentRole, instances: [student]},
        ]);
    });

    it("partitions active and completed instances by the presence of a current step", () => {
        const studentRole = role("Student", "Student", "Student");
        const active = instance("active", [studentRole.name]);
        const completed = instance("completed", [studentRole.name], "Project", null);

        expect(partitionPersonalInstancesByCompletion([active, completed])).toEqual({
            active: [active],
            completed: [completed],
        });
    });
});
