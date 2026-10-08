import {fetchEventSource} from "@microsoft/fetch-event-source";

class StopConfigStream extends Error {}

type ConfigSubscription = {
    apiUrl: string;
    accessToken: string;
    signal: AbortSignal;
    revision: {current: string | null};
    onChange: () => void;
};

export function subscribeToConfigChanges({
    apiUrl,
    accessToken,
    signal,
    revision,
    onChange,
}: ConfigSubscription) {
    return fetchEventSource(`${apiUrl.replace(/\/$/, "")}/Versions/Events`, {
        signal,
        headers: {Authorization: `Bearer ${accessToken}`},
        async onopen(response) {
            // Disabled endpoint, expired token, or denied access: wait for a new token/session.
            if (response.status >= 400 && response.status < 500 && response.status !== 429) {
                throw new StopConfigStream(`Config stream returned ${response.status}`);
            }
            if (
                !response.ok ||
                !response.headers.get("content-type")?.startsWith("text/event-stream")
            ) {
                throw new Error("Config stream unavailable");
            }
        },
        onmessage(message) {
            if (message.event !== "config-changed" || !message.data) return;

            const previous = revision.current;
            revision.current = message.data;
            // The first snapshot establishes the revision; reconnect snapshots may reveal a missed save.
            if (previous !== null && previous !== message.data) onChange();
        },
        onclose() {
            throw new Error("Config stream disconnected");
        },
        onerror(error) {
            if (error instanceof StopConfigStream) throw error;
            return 1000;
        },
    });
}
