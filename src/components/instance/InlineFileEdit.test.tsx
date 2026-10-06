import "@testing-library/jest-dom/vitest";
import {cleanup, fireEvent, render, screen, waitFor} from "@testing-library/react";
import {afterEach, beforeEach, expect, it, vi} from "vitest";

import {InlineFileEdit} from "./InlineFileEdit";
import type {Answer, FileQuestion} from "~/store/api/types/submissions";

const api = vi.hoisted(() => ({save: vi.fn(), remove: vi.fn(), fetching: false}));
vi.mock("~/hooks/useTranslate.ts", () => ({
    useTranslate: () => ({t: (key: string) => key, i18n: {language: "en"}}),
}));
vi.mock("~/store/api/answersApi.ts", () => ({
    answersApi: {
        endpoints: {
            saveFile: {useMutation: () => [api.save, {}]},
            saveAnswer: {useMutation: () => [vi.fn(), {}]},
            deleteFile: {useMutation: () => [api.remove, {}]},
        },
    },
}));
vi.mock("~/store/api/instancesApi.ts", () => ({
    instancesApi: {endpoints: {getInstance: {useQuery: () => ({isFetching: api.fetching})}}},
}));
vi.mock("~/store/api/submissionsApi.ts", () => ({
    submissionsApi: {endpoints: {getSubmission: {useQuery: () => ({isFetching: api.fetching})}}},
}));
vi.mock("@uva-fnwi/datanose-ui", () => ({
    Button: ({
        children,
        onClick,
        disabled,
        "aria-label": label,
    }: React.ComponentProps<"button">) => (
        <button onClick={onClick} disabled={disabled} aria-label={label}>
            {children}
        </button>
    ),
    Link: ({children}: React.ComponentProps<"a">) => <a>{children}</a>,
    Text: ({children}: React.ComponentProps<"span">) => <span>{children}</span>,
    Icon: () => null,
    FileUpload: () => null,
    Modal: () => null,
}));

beforeEach(() => {
    vi.clearAllMocks();
    api.fetching = false;
    api.remove.mockImplementation(() => ({unwrap: () => Promise.resolve({})}));
});
afterEach(cleanup);

const editor = () => (
    <InlineFileEdit
        question={
            {
                name: "Extras",
                isArray: true,
                allowedFileTypes: ["*"],
                allowedFileSize: 1000,
            } as FileQuestion
        }
        answer={
            {
                value: ["existing.txt"],
                files: [{id: "existing", name: "existing.txt", length: 1, accessToken: ""}],
            } as Answer
        }
        instanceId="instance"
        submissionId="submission"
    />
);

const setup = () => render(editor());

it("stops a batch after a failed upload and keeps its error visible", async () => {
    api.save.mockImplementation(() => ({unwrap: () => Promise.reject(new Error("failed"))}));
    setup();
    fireEvent.change(screen.getByLabelText("file_upload.select_files"), {
        target: {files: [new File(["a"], "first.txt"), new File(["b"], "second.txt")]},
    });
    await screen.findByText("file_upload.error_upload_failed");
    await waitFor(() =>
        expect(screen.getByRole("button", {name: "file_upload.select_files"})).toBeEnabled(),
    );
    expect(api.save).toHaveBeenCalledTimes(1);
});

it("blocks competing mutations until uploads and refreshes finish", async () => {
    let finishUpload!: () => void;
    const upload = new Promise<void>((resolve) => {
        finishUpload = resolve;
    });
    api.save.mockImplementation(() => ({unwrap: () => upload}));
    const view = setup();
    fireEvent.change(screen.getByLabelText("file_upload.select_files"), {
        target: {files: [new File(["a"], "first.txt")]},
    });
    const remove = screen.getByRole("button", {name: "instance.summary.delete_file: existing.txt"});
    expect(remove).toBeDisabled();
    fireEvent.click(remove);
    expect(api.remove).not.toHaveBeenCalled();
    api.fetching = true;
    view.rerender(editor());
    finishUpload();
    await waitFor(() => expect(remove).toBeDisabled());
    api.fetching = false;
    view.rerender(editor());
    await waitFor(() => expect(remove).toBeEnabled());
});
