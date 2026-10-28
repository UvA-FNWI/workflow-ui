import type {KeyboardEvent} from "react";

/** Submit comment/reply: ⌘↵ on macOS, Ctrl↵ on Windows/Linux. */
export function isMessageSubmitShortcut(event: KeyboardEvent): boolean {
    return event.key === "Enter" && (event.metaKey || event.ctrlKey) && !event.altKey;
}

export function handleMessageSubmitShortcut(
    event: KeyboardEvent,
    onSubmit: () => void,
    canSubmit: boolean,
): void {
    if (!isMessageSubmitShortcut(event)) return;
    event.preventDefault();
    if (canSubmit) onSubmit();
}
