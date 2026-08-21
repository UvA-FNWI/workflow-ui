import {cleanup, fireEvent, render, screen} from "@testing-library/react";
import {afterEach, expect, it, vi} from "vitest";

import {InfoCards} from "../InfoCard.tsx";
import type {InfoCard} from "~/store/api/types/instances.ts";

vi.mock("~/hooks/useTranslate", () => ({
    useTranslate: () => ({
        l: (value?: {en: string}) => value?.en ?? "",
        t: (key: string) => ({show_all: "Show all", show_less: "Show less"})[key] ?? key,
    }),
}));

afterEach(cleanup);

it("renders configured cards in order and expands compact user fields", () => {
    const cards: InfoCard[] = [
        {
            name: "Student",
            type: "User",
            title: {en: "Student", nl: "Student"},
            user: {displayName: "Ada Student", picture: null},
            fields: ["Email", "Number", "Programme", "Cohort"].map((title) => ({
                title: {en: title, nl: title},
                value: title,
                href: null,
                icon: null,
            })),
            emptyText: null,
        },
        {
            name: "Links",
            type: "Links",
            title: {en: "Useful links", nl: "Links"},
            items: [
                {
                    name: "Handbook",
                    type: "Link",
                    text: {en: "Handbook", nl: "Handboek"},
                    url: {en: "https://example.com", nl: "https://example.com"},
                },
            ],
        },
        {
            name: "Notice",
            type: "Text",
            title: {en: "Notice", nl: "Melding"},
            content: {en: "**Maintenance** Friday", nl: "**Onderhoud** vrijdag"},
        },
    ];

    render(<InfoCards cards={cards} instanceId="project-1" />);

    expect(screen.getAllByRole("heading").map((heading) => heading.textContent)).toEqual([
        "Ada Student",
        "Useful links",
        "Notice",
    ]);
    expect(screen.queryByText("Cohort")).toBeNull();
    fireEvent.click(screen.getByText("Show all"));
    expect(screen.getByText("Cohort")).toBeTruthy();
    expect(screen.getByText("Maintenance")).toBeTruthy();
});
