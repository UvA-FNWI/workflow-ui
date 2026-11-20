/** Show a field balloon or Comments card only when the user can start a thread or there is something to read. */
export function shouldShowMessageUi(canAdd: boolean, threadCount: number): boolean {
    return canAdd || threadCount > 0;
}

/** Instance path for a field thread. Leaf names stay leaf names; embedded forms are prefixed. */
export function fieldMessageQuestionName(
    propertyName: string | null | undefined,
    questionName: string,
): string {
    return propertyName ? `${propertyName}.${questionName}` : questionName;
}
