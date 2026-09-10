type Save = {failed: boolean; retry: () => Promise<unknown>};
type PendingAnswers = {
    flushers: Set<() => void>;
    pending: Set<Promise<void>>;
    latest: Map<string, Save>;
    waiters: number;
};

// Share save state across tabs: inputs may unmount while their requests are still running.
// Scope it to a submission so submitting one form does not wait for unrelated forms.
const forms = new Map<string, PendingAnswers>();
const formKey = (instanceId: string, submissionId: string) =>
    JSON.stringify([instanceId, submissionId]);

function getPending(key: string): PendingAnswers {
    let state = forms.get(key);
    if (!state) {
        state = {flushers: new Set(), pending: new Set(), latest: new Map(), waiters: 0};
        forms.set(key, state);
    }
    return state;
}

function release(key: string, state: PendingAnswers) {
    // Keep failures for retry and keep the same state while a submit attempt is waiting.
    if (!state.flushers.size && !state.pending.size && !state.latest.size && !state.waiters) {
        forms.delete(key);
    }
}

// Let Submit trigger edits still waiting on an input's debounce timer.
export function registerAnswerFlusher(instanceId: string, submissionId: string, flush: () => void) {
    const key = formKey(instanceId, submissionId);
    const state = getPending(key);
    state.flushers.add(flush);
    return () => {
        state.flushers.delete(flush);
        release(key, state);
    };
}

// Track request completion independently of whether the input is still mounted.
// Only the latest save for a question can leave an error or clear one.
export function trackAnswerSave(
    instanceId: string,
    submissionId: string,
    questionName: string,
    request: Promise<unknown>,
    retry: () => Promise<unknown>,
) {
    const key = formKey(instanceId, submissionId);
    const state = getPending(key);
    const save: Save = {failed: false, retry};
    state.latest.set(questionName, save);
    const pending = request
        .then(
            () => {
                if (state.latest.get(questionName) === save) state.latest.delete(questionName);
            },
            () => {
                save.failed = true;
            },
        )
        .finally(() => {
            state.pending.delete(pending);
            release(key, state);
        });
    state.pending.add(pending);
}

// Resolve only when this form's edits are saved; reject so the caller keeps the form open.
export async function flushPendingAnswers(instanceId: string, submissionId: string): Promise<void> {
    const key = formKey(instanceId, submissionId);
    const state = getPending(key);
    state.waiters++;
    try {
        state.flushers.forEach((flush) => flush());
        // Retry earlier failures once per submit attempt, after flushing newer edits.
        for (const save of [...state.latest.values()]) {
            if (save.failed) void save.retry().catch(() => {});
        }
        // The user can keep typing while requests run, so flush again after each batch.
        for (;;) {
            state.flushers.forEach((flush) => flush());
            if (!state.pending.size) break;
            await Promise.all([...state.pending]);
        }
        if ([...state.latest.values()].some((save) => save.failed)) {
            throw new Error("Answers could not be saved");
        }
    } finally {
        state.waiters--;
        release(key, state);
    }
}
