import {describe, expect, it, vi} from "vitest";

import {
    handleMessageSubmitShortcut,
    isMessageSubmitShortcut,
    type MessageSubmitShortcutEvent,
} from "../messageComposerShortcuts";

function shortcutEvent(
    overrides: Partial<MessageSubmitShortcutEvent> & Pick<MessageSubmitShortcutEvent, "key">,
): MessageSubmitShortcutEvent {
    return {
        metaKey: false,
        ctrlKey: false,
        altKey: false,
        preventDefault: vi.fn(),
        ...overrides,
    };
}

describe("messageComposerShortcuts", () => {
    it("recognizes meta+enter and ctrl+enter", () => {
        expect(isMessageSubmitShortcut(shortcutEvent({key: "Enter", metaKey: true}))).toBe(true);
        expect(isMessageSubmitShortcut(shortcutEvent({key: "Enter", ctrlKey: true}))).toBe(true);
        expect(isMessageSubmitShortcut(shortcutEvent({key: "Enter"}))).toBe(false);
    });

    it("submits when allowed and prevents default", () => {
        const onSubmit = vi.fn();
        const event = shortcutEvent({key: "Enter", metaKey: true});

        handleMessageSubmitShortcut(event, onSubmit, true);

        expect(event.preventDefault).toHaveBeenCalledOnce();
        expect(onSubmit).toHaveBeenCalledOnce();
    });

    it("does not submit when the field is empty", () => {
        const onSubmit = vi.fn();
        const event = shortcutEvent({key: "Enter", metaKey: true});

        handleMessageSubmitShortcut(event, onSubmit, false);

        expect(onSubmit).not.toHaveBeenCalled();
    });
});
