import {expect, it} from "vitest";

import {formatAnswer, hasReferenceId} from "~/utils/formatAnswer.ts";

it("formats user arrays", () => {
    expect(formatAnswer([{displayName: "Ada"}, {displayName: "Grace"}], "User")).toBe("Ada, Grace");
});

it("counts object arrays rather than stringifying them", () => {
    expect(formatAnswer([{Grade: 8}, {Grade: 9}], "Object")).toBe("2 items");
});

it("formats reference answers using instance titles", () => {
    const choices = [
        {name: "abc", text: {en: "Introduction to AI", nl: "Inleiding AI"}},
        {name: "def", text: {en: "Statistics", nl: "Statistiek"}},
    ];
    expect(formatAnswer("abc", "Reference", "en", choices)).toBe("Introduction to AI");
    expect(formatAnswer("def", "Reference", "nl", choices)).toBe("Statistiek");
    expect(formatAnswer(["abc", "def"], "Reference", "en", choices)).toBe(
        "Introduction to AI, Statistics",
    );
});

it("hasReferenceId is false when there is no stored id", () => {
    expect(hasReferenceId(null)).toBe(false);
    expect(hasReferenceId(undefined)).toBe(false);
    expect(hasReferenceId("")).toBe(false);
    expect(hasReferenceId([])).toBe(false);
    expect(hasReferenceId("abc")).toBe(true);
    expect(hasReferenceId(["abc"])).toBe(true);
});
