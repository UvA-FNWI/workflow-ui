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

it.each([
    {screenType: "with a progress column", withProgressColumn: true, stoppedEventId: "Cancel"},
    {screenType: "without a progress column", withProgressColumn: false, stoppedEventId: null},
])("styles and sorts stopped rows $screenType", ({withProgressColumn, stoppedEventId}) => {
    const screenColumns = withProgressColumn
        ? columns
        : columns.filter((column) => column.columnType !== "CurrentStep");
    render(
        <MemoryRouter>
            <ScreenTable
                columns={screenColumns}
                rows={[
                    {name: "Paused", eventId: "Pause"},
                    {name: "Zulu"},
                    {name: "Stopped", eventId: stoppedEventId},
                    {name: "Alpha"},
                ].map(({name, eventId}) => {
                    const progress = {
                        text: {en: name, nl: name},
                        color: eventId === undefined ? "Green" : "Red",
                        eventId,
                    };
                    return {
                        id: name,
                        stoppedProgress: eventId === undefined ? null : progress,
                        values: {
                            0: `${name} student`,
                            1: `${name} title`,
                            2: `${name} course`,
                            ...(withProgressColumn ? {3: progress} : {}),
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
    }

    expect(screen.getByText("Alpha title").closest(".line-through")).toBeNull();
    if (withProgressColumn) {
        for (const status of ["Paused", "Stopped"]) {
            const progress = screen.getByText(status);
            expect(progress).toHaveClass("font-bold");
            expect(progress.parentElement).toHaveClass("gap-2");
            expect(progress.previousElementSibling).toHaveClass("w-2", "shrink-0");
            expect(progress.closest(".line-through")).toBeNull();
            expect(progress.closest("td")?.querySelector(".rounded-full")).toBeNull();
        }
        const activeProgress = screen.getByText("Alpha");
        expect(activeProgress).not.toHaveClass("font-bold");
        expect(activeProgress.parentElement).toHaveClass("gap-2");
        expect(activeProgress.previousElementSibling).toHaveClass(
            "w-2",
            "shrink-0",
            "bg-green-600",
        );
    }

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
