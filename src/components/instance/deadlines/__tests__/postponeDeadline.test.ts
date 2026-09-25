import {describe, expect, it} from "vitest";

import {
    deadlineDate,
    getExtendableDeadlines,
    postponeByDays,
    remainingPostponementDays,
} from "../postponeDeadline";
import type {WorkflowStep} from "~/store/api/types/instances";

const deadlines = [
    {
        property: "ProposalDeadline",
        title: {en: "Proposal", nl: "Voorstel"},
        date: "2027-03-27T23:00:00Z",
    },
    {
        property: "FinalDeadline",
        title: {en: "Final", nl: "Eindversie"},
        date: "2027-04-01T10:00:00+02:00",
    },
];

describe("deadline postponement", () => {
    it("collects initialized property deadlines from nested steps, including completed ones, only once", () => {
        const step = (
            id: string,
            property: string | null,
            date: string | null,
            children: WorkflowStep[] = [],
        ): WorkflowStep => ({
            id,
            title: {en: id, nl: id},
            icon: null,
            event: id,
            dateCompleted: "2026-01-01",
            deadline: {property, date, type: "Hard", isPassed: false, message: null},
            children,
            versions: null,
            headerStatus: null,
            resultsType: "Normal",
            expectsSubmission: false,
            hasSubmission: false,
            hierarchyMode: "Sequential",
        });
        expect(
            getExtendableDeadlines([
                step("Proposal", "ProposalDeadline", deadlines[0].date, [
                    step("Same", "ProposalDeadline", deadlines[0].date),
                ]),
                step("Fixed", null, deadlines[0].date),
                step("Unset", "UnsetDate", null),
            ]),
        ).toEqual([
            {
                property: "ProposalDeadline",
                title: {en: "Proposal", nl: "Proposal"},
                date: deadlines[0].date,
            },
        ]);
    });
    it("uses Amsterdam calendar dates, including UTC values around midnight", () => {
        expect(deadlineDate(deadlines[0]!.date)).toBe("2027-03-28");
    });
    it("extends every provided deadline by days across daylight saving", () => {
        expect(postponeByDays(deadlines, 7)).toEqual([
            {property: "ProposalDeadline", previousDate: deadlines[0]!.date, newDate: "2027-04-04"},
            {property: "FinalDeadline", previousDate: deadlines[1]!.date, newDate: "2027-04-08"},
        ]);
    });
    it.each([0, -1, 0.5, NaN, Infinity, Number.MAX_SAFE_INTEGER])(
        "does not create changes for invalid duration %s",
        (days) => {
            expect(postponeByDays(deadlines, days)).toEqual([]);
        },
    );
});

it("uses the smallest remaining allowance across deadlines and keeps unset dates unlimited", () => {
    const limited = [
        {...deadlines[0], maxDate: "2027-04-04"},
        {...deadlines[1], maxDate: "2027-04-15"},
    ];
    expect(remainingPostponementDays(limited)).toBe(7);
    expect(postponeByDays(limited, 7)).toHaveLength(2);
    expect(postponeByDays(limited, 8)).toEqual([]);
    expect(remainingPostponementDays(deadlines)).toBeUndefined();
    expect(remainingPostponementDays([{...deadlines[0], maxDate: "2027-03-28"}])).toBe(0);
});
