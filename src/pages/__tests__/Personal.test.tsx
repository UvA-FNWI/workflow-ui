import {MemoryRouter} from "react-router";

import {cleanup, fireEvent, render, screen, within} from "@testing-library/react";
import {afterEach, expect, it, vi} from "vitest";

import {PersonalContent} from "../Personal";
import type {PersonalInstance} from "~/store/api/types/personal";

vi.mock("~/hooks/useTranslate", () => ({
    useTranslate: () => ({
        t: (key: string) => key,
        l: (value?: {en: string}) => value?.en,
        i18n: {language: "en"},
    }),
}));

vi.mock("~/store/api/personalApi", () => ({
    useGetPersonalInstancesQuery: () => ({
        data: {
            roles: [{name: "Supervisor", title: {en: "Supervisor", nl: "Begeleider"}}],
            instances: [
                project("Paused", "Pause"),
                project("Zulu"),
                project("Stopped", "Cancel"),
                project("Alpha"),
            ],
        },
    }),
}));

afterEach(cleanup);

function project(name: string, eventId?: string): PersonalInstance {
    return {
        id: name.toLowerCase(),
        workflowDefinition: "Project-Playground",
        workflowDefinitionTitle: {en: "Projects", nl: "Projecten"},
        title: `${name} project`,
        currentStep: "Upload",
        workflowStopped: eventId !== undefined,
        progress: {text: {en: name, nl: name}, color: "Red", eventId},
        createdOn: "2026-01-01",
        roles: ["Supervisor"],
        student: `${name} student`,
        course: `${name} course`,
        staff: [{userName: `${name}-staff`, displayName: `${name} staff`, roles: []}],
    };
}

it("strikes through only stopped rows and keeps them last when sorting", () => {
    render(
        <MemoryRouter>
            <PersonalContent />
        </MemoryRouter>,
    );
    expect(screen.queryByRole("button", {name: /^stopped/})).not.toBeInTheDocument();
    const table = within(screen.getByRole("table"));
    const studentNames = () => table.getAllByRole("link").map((link) => link.textContent);
    expect(studentNames()).toEqual([
        "Paused student",
        "Zulu student",
        "Alpha student",
        "Stopped student",
    ]);

    for (const name of ["Alpha", "Paused", "Stopped"]) {
        const inactive = name !== "Alpha";
        const row = within(table.getByRole("row", {name: new RegExp(`${name} student`)}));
        const student = row.getByRole("link", {name: `${name} student`});
        const progress = row.getByRole("cell", {name});

        for (const field of ["project", "course", "staff"]) {
            expect(!!row.getByText(`${name} ${field}`).closest(".line-through")).toBe(
                name === "Stopped",
            );
        }
        expect(student.closest(".line-through")).toBeNull();
        expect(progress.querySelector(".line-through")).toBeNull();
        expect(!!progress.querySelector(".rounded-full")).toBe(!inactive);
        expect(!!progress.querySelector(".font-bold")).toBe(inactive);
    }

    const studentHeader = table.getByRole("columnheader", {name: "columns.student_name"});
    fireEvent.click(studentHeader);
    expect(studentNames()).toEqual([
        "Alpha student",
        "Paused student",
        "Zulu student",
        "Stopped student",
    ]);
    fireEvent.click(studentHeader);
    expect(studentNames()).toEqual([
        "Zulu student",
        "Paused student",
        "Alpha student",
        "Stopped student",
    ]);
});
