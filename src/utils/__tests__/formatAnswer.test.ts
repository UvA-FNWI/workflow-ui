import {expect, it} from "vitest";

import {formatAnswer} from "~/utils/formatAnswer.ts";

it("formats user arrays", () => {
    expect(formatAnswer([{displayName: "Ada"}, {displayName: "Grace"}], "User")).toBe("Ada, Grace");
});

it("counts object arrays rather than stringifying them", () => {
    expect(formatAnswer([{Grade: 8}, {Grade: 9}], "Object")).toBe("2 items");
});
