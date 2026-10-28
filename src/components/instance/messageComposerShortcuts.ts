/** Keyboard data needed to detect ⌘↵ / Ctrl↵ submit in message composers. */
export type MessageSubmitShortcutEvent = Pick<
    KeyboardEvent,
    "key" | "metaKey" | "ctrlKey" | "altKey" | "preventDefault"
>;

/** Submit comment/reply: ⌘↵ on macOS, Ctrl↵ on Windows/Linux. */
export function isMessageSubmitShortcut(event: MessageSubmitShortcutEvent): boolean {
    return event.key === "Enter" && (event.metaKey || event.ctrlKey) && !event.altKey;
}

export function handleMessageSubmitShortcut(
    event: MessageSubmitShortcutEvent,
    onSubmit: () => void,
    canSubmit: boolean,
): void {
    if (!isMessageSubmitShortcut(event)) return;
    event.preventDefault();
    if (canSubmit) onSubmit();
}
