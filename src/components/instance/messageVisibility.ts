/** Show a field balloon or Comments card only when the user can start a thread or there is something to read. */
export function shouldShowMessageUi(canAdd: boolean, threadCount: number): boolean {
    return canAdd || threadCount > 0;
}
