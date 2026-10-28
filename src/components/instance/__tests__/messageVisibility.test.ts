import {describe, expect, it} from "vitest";

import {shouldShowMessageUi} from "../messageVisibility.ts";

describe("shouldShowMessageUi", () => {
    it("shows an empty balloon when the user can add comments", () => {
        expect(shouldShowMessageUi(true, 0)).toBe(true);
    });

    it("hides the balloon when the user cannot add and the line has no threads", () => {
        expect(shouldShowMessageUi(false, 0)).toBe(false);
    });

    it("shows the balloon for a reader when the line has open or closed threads", () => {
        expect(shouldShowMessageUi(false, 1)).toBe(true);
    });
});
