// Save responses contain whole-instance snapshots. Keep writes for an instance in
// order so a slower, older request cannot overwrite a more recent answer.
const pendingSaves = new Map<string, Promise<unknown>>();

export async function queueAnswerSave<T>(instanceId: string, save: () => Promise<T>): Promise<T> {
    const previous = pendingSaves.get(instanceId) ?? Promise.resolve();
    const pending = previous.catch(() => {}).then(save);
    pendingSaves.set(instanceId, pending);
    try {
        return await pending;
    } finally {
        if (pendingSaves.get(instanceId) === pending) pendingSaves.delete(instanceId);
    }
}
