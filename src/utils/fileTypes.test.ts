import {describe, expect, it} from "vitest";

import {formatAllowedFileSize, formatAllowedFileTypes, toFileInputAccept} from "./fileTypes";

describe("fileTypes", () => {
    it("formats file types as a localized list", () => {
        expect(formatAllowedFileTypes(["pdf", "doc", "docx"], "en")).toBe("PDF, DOC or DOCX");
        expect(formatAllowedFileTypes(["pdf", "doc", "docx"], "nl")).toBe("PDF, DOC of DOCX");
    });

    it("adds dots only for the browser accept attribute", () => {
        expect(toFileInputAccept(["pdf", "zip"])).toEqual([".pdf", ".zip"]);
    });

    it("formats configured file sizes", () => {
        expect(formatAllowedFileSize(500)).toBe("500B");
        expect(formatAllowedFileSize(1500)).toBe("1.5KB");
        expect(formatAllowedFileSize(1_500_000)).toBe("1.5MB");
    });
});
