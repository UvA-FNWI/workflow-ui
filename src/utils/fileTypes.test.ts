import {describe, expect, it} from "vitest";

import {
    formatAllowedFileSize,
    formatAllowedFileTypes,
    getAllowedFileSize,
    getAllowedFileTypes,
    toFileInputAccept,
} from "./fileTypes";

describe("fileTypes", () => {
    it("defaults to PDF", () => {
        expect(getAllowedFileTypes()).toEqual(["pdf"]);
    });

    it("normalizes and deduplicates configured file types", () => {
        expect(getAllowedFileTypes(["PDF", ".zip", ".pdf"])).toEqual(["pdf", "zip"]);
    });

    it("formats file types for display", () => {
        expect(formatAllowedFileTypes(["pdf", "tar.gz"])).toBe("PDF, TAR.GZ");
    });

    it("adds dots only for the browser accept attribute", () => {
        expect(toFileInputAccept(["pdf", "zip"])).toEqual([".pdf", ".zip"]);
    });

    it("defaults the maximum file size to 10000000 bytes", () => {
        expect(getAllowedFileSize()).toBe(10_000_000);
        expect(formatAllowedFileSize(getAllowedFileSize())).toBe("10 MB");
    });

    it("formats configured file sizes", () => {
        expect(formatAllowedFileSize(500)).toBe("500 B");
        expect(formatAllowedFileSize(1500)).toBe("1.5 KB");
        expect(formatAllowedFileSize(1_500_000)).toBe("1.5 MB");
    });
});
