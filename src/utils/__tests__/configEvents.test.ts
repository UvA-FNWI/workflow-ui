import {type EventSourceMessage, fetchEventSource} from "@microsoft/fetch-event-source";
import {beforeEach, describe, expect, it, vi} from "vitest";

import {subscribeToConfigChanges} from "../configEvents";

vi.mock("@microsoft/fetch-event-source", () => ({fetchEventSource: vi.fn()}));

beforeEach(() => {
    vi.mocked(fetchEventSource).mockReset().mockResolvedValue(undefined);
});

async function connect(revision = {current: null as string | null}) {
    const controller = new AbortController();
    const onChange = vi.fn();
    const onConnectionChange = vi.fn();
    await subscribeToConfigChanges({
        apiUrl: "http://localhost:5124/",
        accessToken: "developer-token",
        signal: controller.signal,
        revision,
        onChange,
        onConnectionChange,
    });
    const options = vi.mocked(fetchEventSource).mock.lastCall![1]!;
    const send = (data: string, event = "config-changed") =>
        options.onmessage!({data, event, id: ""} satisfies EventSourceMessage);
    return {options, send, onChange, onConnectionChange, revision, controller};
}

describe("config event stream", () => {
    it("reports connections, errors, disconnects, and reconnections", async () => {
        const {options, onConnectionChange} = await connect();
        const response = () => new Response(null, {headers: {"content-type": "text/event-stream"}});
        await options.onopen!(response());
        expect(onConnectionChange).toHaveBeenLastCalledWith(true);

        options.onerror!(new Error("Connection lost"));
        expect(onConnectionChange).toHaveBeenLastCalledWith(false);

        await options.onopen!(response());
        expect(onConnectionChange).toHaveBeenLastCalledWith(true);
        expect(() => options.onclose!()).toThrow("disconnected");
        expect(onConnectionChange).toHaveBeenLastCalledWith(false);
    });

    it("reports when a request is aborted, including when the tab is hidden", async () => {
        const {options, onConnectionChange} = await connect();
        const request = new AbortController();
        const fetch = vi.spyOn(window, "fetch").mockResolvedValue(new Response());
        try {
            await options.fetch!("http://localhost:5124/Versions/Events", {
                signal: request.signal,
            });
            await options.onopen!(
                new Response(null, {headers: {"content-type": "text/event-stream"}}),
            );
            expect(onConnectionChange).toHaveBeenLastCalledWith(true);
            request.abort();
            expect(onConnectionChange).toHaveBeenLastCalledWith(false);
        } finally {
            fetch.mockRestore();
        }
    });

    it("uses the bearer token and lets unmount abort the connection", async () => {
        const {options, controller} = await connect();
        expect(fetchEventSource).toHaveBeenCalledWith(
            "http://localhost:5124/Versions/Events",
            options,
        );
        expect(options.headers).toEqual({Authorization: "Bearer developer-token"});
        expect(options.signal).toBe(controller.signal);
    });

    it("does not refresh on the initial snapshot or duplicate revisions", async () => {
        const {send, onChange} = await connect();
        send("revision-1");
        send("revision-1");
        send("", "heartbeat");
        expect(onChange).not.toHaveBeenCalled();

        send("revision-2");
        send("revision-2");
        expect(onChange).toHaveBeenCalledTimes(1);
    });

    it("detects a save missed while disconnected, using the reconnect snapshot", async () => {
        const first = await connect();
        first.send("revision-1");

        const reconnected = await connect(first.revision);
        reconnected.send("revision-2");
        expect(reconnected.onChange).toHaveBeenCalledTimes(1);
    });

    it("a freshly reloaded page establishes its revision without another refresh", async () => {
        const {send, onChange} = await connect();
        send("revision-2");
        expect(onChange).not.toHaveBeenCalled();
    });

    it.each([401, 403, 404])("stops retrying for HTTP %s", async (status) => {
        const {options} = await connect();
        const error = await options.onopen!(new Response(null, {status})).catch((error) => error);
        expect(error).toBeInstanceOf(Error);
        expect(() => options.onerror!(error)).toThrow();
    });

    it.each([429, 503])("retries transient HTTP %s failures", async (status) => {
        const {options} = await connect();
        const error = await options.onopen!(new Response(null, {status})).catch((error) => error);
        expect(options.onerror!(error)).toBe(1000);
    });

    it("validates the stream response and retries unexpected disconnects", async () => {
        const {options} = await connect();
        await expect(
            options.onopen!(new Response(null, {headers: {"content-type": "text/event-stream"}})),
        ).resolves.toBeUndefined();
        await expect(
            options.onopen!(new Response("<html>", {headers: {"content-type": "text/html"}})),
        ).rejects.toThrow("unavailable");
        expect(() => options.onclose!()).toThrow("disconnected");
        expect(options.onerror!(new Error("Connection lost"))).toBe(1000);
    });
});
