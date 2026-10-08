import {fetchEventSource} from "@microsoft/fetch-event-source";

class StopConfigStream extends Error {}

type ConfigSubscription = {
    apiUrl: string;
    accessToken: string;
    signal: AbortSignal;
    revision: {current: string | null};
    onChange: () => void;
    onConnectionChange: (connected: boolean) => void;
};

export function subscribeToConfigChanges({
    apiUrl,
    accessToken,
    signal,
    revision,
    onChange,
    onConnectionChange,
}: ConfigSubscription) {
    return fetchEventSource(`${apiUrl.replace(/\/$/, "")}/Versions/Events`, {
        signal,
        headers: {Authorization: `Bearer ${accessToken}`},
        fetch(input, init) {
            onConnectionChange(false);
            // The stream library also aborts its request when the tab is hidden.
            init?.signal?.addEventListener("abort", () => onConnectionChange(false), {once: true});
            return window.fetch(input, init);
        },
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
            onConnectionChange(true);
        },
        onmessage(message) {
            if (message.event !== "config-changed" || !message.data) return;

            const previous = revision.current;
            revision.current = message.data;
            // The first snapshot establishes the revision; reconnect snapshots may reveal a missed save.
            if (previous !== null && previous !== message.data) onChange();
        },
        onclose() {
            onConnectionChange(false);
            throw new Error("Config stream disconnected");
        },
        onerror(error) {
            onConnectionChange(false);
            if (error instanceof StopConfigStream) throw error;
            return 1000;
        },
    });
}
