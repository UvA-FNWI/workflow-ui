import "@testing-library/jest-dom/vitest";
import {cleanup, fireEvent, render, screen, waitFor} from "@testing-library/react";
import {afterEach, expect, it, vi} from "vitest";

import {FileUploadTable} from "./FileUploadTable";
import type {Answer, Question} from "~/store/api/types/submissions";

const toast = vi.hoisted(() => ({success: vi.fn(), error: vi.fn()}));
vi.mock("@uva-fnwi/datanose-ui", async (importOriginal) => ({
    ...(await importOriginal<typeof import("@uva-fnwi/datanose-ui")>()),
    useToast: () => toast,
}));
vi.mock("~/hooks/useTranslate", () => ({
    useTranslate: () => ({t: (key: string) => key, l: () => "Attachments", i18n: {language: "en"}}),
}));
afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
    vi.clearAllMocks();
});

it.each([
    [false, false],
    [false, true],
    [true, false],
    [true, true],
])("removes stored files with isArray=%s and failure=%s", async (isArray, fails) => {
    vi.spyOn(console, "error").mockImplementation(() => {});
    const remove = fails
        ? vi.fn().mockRejectedValue(new Error("failed"))
        : vi.fn().mockResolvedValue(undefined);
    const select = vi.fn().mockResolvedValue({success: true, error: null});
    render(
        <FileUploadTable
            questions={[
                {
                    name: "Attachments",
                    isArray,
                    allowedFileTypes: ["*"],
                    allowedFileSize: 1000,
                } as Question,
            ]}
            values={{Attachments: null}}
            answers={[
                {
                    questionName: "Attachments",
                    files: [{id: "file", name: "file.txt", length: 1, accessToken: ""}],
                } as Answer,
            ]}
            onFileSelect={select}
            onRemoveStoredFile={remove}
        />,
    );
    fireEvent.click(
        screen.getByRole("button", {
            name: isArray ? "instance.summary.delete_file: file.txt" : "Remove file",
        }),
    );
    await waitFor(() =>
        expect(fails ? toast.error : toast.success).toHaveBeenCalledWith(
            fails ? "file_upload.error_remove_failed" : "file_upload.removed_success",
        ),
    );
    expect(remove).toHaveBeenCalledWith("Attachments", isArray ? "file" : undefined);
    if (!isArray && !fails) expect(select).toHaveBeenCalledWith("Attachments", null);
    else expect(select).not.toHaveBeenCalled();
});
