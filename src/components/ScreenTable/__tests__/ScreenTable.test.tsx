import {MemoryRouter} from "react-router";

import {cleanup, fireEvent, render, screen} from "@testing-library/react";
import {afterEach, expect, it, vi} from "vitest";

import {ScreenTable} from "../ScreenTable";
import type {LocalString} from "~/hooks/useTranslate";
import type {ScreenColumn} from "~/store/api/types/screens";

vi.mock("~/hooks/useTranslate", () => ({
    useTranslate: () => ({
        i18n: {language: "en"},
        l: (value: LocalString) => value.en,
        t: (key: string) => key,
    }),
}));

afterEach(cleanup);

const columnDefaults = {
    filterType: "None",
    displayType: "Normal",
    columnType: "Normal",
    link: false,
    dataType: "String",
} as const;

const columns: ScreenColumn[] = [
    {
        ...columnDefaults,
        id: 0,
        title: {en: "Student", nl: "Student"},
        property: "Student.DisplayName",
        link: true,
    },
    {...columnDefaults, id: 1, title: {en: "Title", nl: "Titel"}, property: "Title", link: true},
    {...columnDefaults, id: 2, title: {en: "Course", nl: "Vak"}, property: "Course.Name"},
    {
        ...columnDefaults,
        id: 3,
        title: {en: "Progress", nl: "Voortgang"},
        dataType: "Object",
        columnType: "CurrentStep",
    },
];

it("styles paused and stopped rows and keeps stopped rows last when sorting", () => {
    render(
        <MemoryRouter>
            <ScreenTable
                columns={columns}
                rows={[
                    {name: "Paused", eventId: "Pause"},
                    {name: "Zulu"},
                    {name: "Stopped", eventId: "Cancel"},
                    {name: "Alpha"},
                ].map(({name, eventId}) => {
                    const workflowStopped = eventId !== undefined;
                    return {
                        id: name,
                        workflowStopped,
                        values: {
                            0: `${name} student`,
                            1: `${name} title`,
                            2: `${name} course`,
                            3: {
                                text: {en: name, nl: name},
                                color: workflowStopped ? "Red" : "Green",
                                eventId,
                            },
                        },
                    };
                })}
            />
        </MemoryRouter>,
    );

    for (const status of ["Paused", "Stopped"]) {
        expect(
            screen.getByRole("link", {name: `${status} student`}).closest(".line-through"),
        ).toBeNull();
        for (const field of ["title", "course"]) {
            expect(!!screen.getByText(`${status} ${field}`).closest(".line-through")).toBe(
                status === "Stopped",
            );
        }
        const progress = screen.getByText(status);
        expect(progress).toHaveClass("font-bold");
        expect(progress.closest(".line-through")).toBeNull();
        expect(progress.closest("td")?.querySelector(".rounded-full")).toBeNull();
    }

    expect(screen.getByText("Alpha title").closest(".line-through")).toBeNull();
    const activeProgress = screen.getByText("Alpha");
    expect(activeProgress).not.toHaveClass("font-bold");
    expect(activeProgress.closest("td")?.querySelector(".bg-green-600")).toBeInTheDocument();

    const students = () =>
        screen.getAllByRole("link", {name: / student$/}).map((link) => link.textContent);
    expect(students()).toEqual([
        "Paused student",
        "Zulu student",
        "Alpha student",
        "Stopped student",
    ]);

    const studentHeader = screen.getByRole("columnheader", {name: "Student"});
    fireEvent.click(studentHeader);
    expect(students()).toEqual([
        "Alpha student",
        "Paused student",
        "Zulu student",
        "Stopped student",
    ]);
    fireEvent.click(studentHeader);
    expect(students()).toEqual([
        "Zulu student",
        "Paused student",
        "Alpha student",
        "Stopped student",
    ]);
});
