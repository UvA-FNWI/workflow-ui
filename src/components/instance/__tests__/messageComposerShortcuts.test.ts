import {describe, expect, it, vi} from "vitest";

import {handleMessageSubmitShortcut, isMessageSubmitShortcut} from "../messageComposerShortcuts";

describe("messageComposerShortcuts", () => {
    it("recognizes meta+enter and ctrl+enter", () => {
        expect(
            isMessageSubmitShortcut({
                key: "Enter",
                metaKey: true,
                ctrlKey: false,
                altKey: false,
            } as KeyboardEvent),
        ).toBe(true);
        expect(
            isMessageSubmitShortcut({
                key: "Enter",
                metaKey: false,
                ctrlKey: true,
                altKey: false,
            } as KeyboardEvent),
        ).toBe(true);
        expect(
            isMessageSubmitShortcut({
                key: "Enter",
                metaKey: false,
                ctrlKey: false,
                altKey: false,
            } as KeyboardEvent),
        ).toBe(false);
    });

    it("submits when allowed and prevents default", () => {
        const onSubmit = vi.fn();
        const preventDefault = vi.fn();
        const event = {
            key: "Enter",
            metaKey: true,
            ctrlKey: false,
            altKey: false,
            preventDefault,
        } as unknown as KeyboardEvent;

        handleMessageSubmitShortcut(event, onSubmit, true);

        expect(preventDefault).toHaveBeenCalledOnce();
        expect(onSubmit).toHaveBeenCalledOnce();
    });

    it("does not submit when the field is empty", () => {
        const onSubmit = vi.fn();
        const event = {
            key: "Enter",
            metaKey: true,
            ctrlKey: false,
            altKey: false,
            preventDefault: vi.fn(),
        } as unknown as KeyboardEvent;

        handleMessageSubmitShortcut(event, onSubmit, false);

        expect(onSubmit).not.toHaveBeenCalled();
    });
});
