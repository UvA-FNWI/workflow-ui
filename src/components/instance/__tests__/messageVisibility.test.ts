import {describe, expect, it} from "vitest";

import {fieldMessageQuestionName, shouldShowMessageUi} from "../messageVisibility.ts";

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

describe("fieldMessageQuestionName", () => {
    it("keeps a top-level question name", () => {
        expect(fieldMessageQuestionName(null, "Title")).toBe("Title");
    });

    it("prefixes an embedded form question with the form property", () => {
        expect(fieldMessageQuestionName("AssessmentSupervisor", "Consent")).toBe(
            "AssessmentSupervisor.Consent",
        );
        expect(fieldMessageQuestionName("AssessmentReviewer", "Consent")).toBe(
            "AssessmentReviewer.Consent",
        );
    });
});
