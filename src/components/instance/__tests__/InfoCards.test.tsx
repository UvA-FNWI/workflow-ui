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

vi.mock("~/components/StaffCard/AddStaffModal.tsx", () => ({default: () => null}));
vi.mock("~/store/api/instancesApi.ts", () => ({
    instancesEndpoints: {
        assignRelatedUser: {useMutation: () => [vi.fn()]},
        removeRelatedUser: {useMutation: () => [vi.fn()]},
    },
}));
vi.mock("~/store/api/usersApi.ts", () => ({
    useUpdateUserEmailMutation: () => [vi.fn(), {isLoading: false}],
}));
vi.mock("~/store/store.ts", () => ({useAppDispatch: () => vi.fn()}));

afterEach(cleanup);

it("allows assigning required staff when no reviewers are assigned", () => {
    const cards: InfoCard[] = [
        {
            name: "Staff",
            type: "RelatedUsers",
            title: {en: "Staff", nl: "Medewerkers"},
            groups: [
                {
                    name: "default",
                    title: {en: "", nl: ""},
                    userRoles: ["Supervisor", "Second Assessor"].map((role) => ({
                        role,
                        title: {en: role, nl: role},
                        users: [],
                        allowsExternalUsers: false,
                        allowsAssignment: false,
                        allowsMultipleUsers: false,
                        canEdit: true,
                    })),
                },
            ],
        },
    ];

    render(<InfoCards cards={cards} instanceId="project-1" />);

    const header = screen.getByRole("button", {name: /^Staff/});
    fireEvent.click(header);
    expect(screen.getByText("Supervisor")).toBeVisible();
    expect(screen.getByText("Second Assessor")).toBeVisible();
    expect(screen.getAllByRole("button", {name: /add$/})).toHaveLength(2);
});

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

it("does not render a card for Progress type entries", () => {
    const cards: InfoCard[] = [
        {name: "Progress", type: "Progress", title: {en: "Progress", nl: "Voortgang"}},
        {
            name: "Notice",
            type: "Text",
            title: {en: "Notice", nl: "Melding"},
            content: {en: "Some content", nl: "Wat inhoud"},
        },
    ];

    render(<InfoCards cards={cards} instanceId="project-1" />);

    expect(screen.queryByText("Progress")).toBeNull();
    expect(screen.getAllByRole("heading").map((heading) => heading.textContent)).toEqual([
        "Notice",
    ]);
});

it("renders a skeleton loader when isLoading is true, regardless of cards", () => {
    const cards: InfoCard[] = [
        {name: "Progress", type: "Progress", title: {en: "Progress", nl: "Voortgang"}},
    ];
    const {container} = render(<InfoCards cards={cards} instanceId="project-1" isLoading />);

    expect(container.querySelectorAll("[class*='animate-pulse']").length).toBeGreaterThan(0);
    expect(screen.queryByRole("heading")).toBeNull();
});
