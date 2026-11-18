import {describe, expect, it} from "vitest";

import {resolveInstanceMessageSettings} from "../instanceMessageSettings";

describe("resolveInstanceMessageSettings", () => {
    it("returns null when messages are disabled", () => {
        expect(
            resolveInstanceMessageSettings({name: "X", messagesEnabled: false} as never),
        ).toBeNull();
    });

    it("uses defaults when enabled without a messages block", () => {
        expect(resolveInstanceMessageSettings({name: "X", messagesEnabled: true} as never)).toEqual(
            {
                card: true,
                layout: "threaded",
                allowClose: true,
                callout: false,
            },
        );
    });

    it("honours explicit settings from the API", () => {
        expect(
            resolveInstanceMessageSettings({
                name: "X",
                messagesEnabled: true,
                messages: {
                    card: false,
                    layout: "flat",
                    allowClose: false,
                    callout: true,
                    fieldsAllowAll: false,
                },
            } as never),
        ).toEqual({
            card: false,
            layout: "flat",
            allowClose: false,
            callout: true,
        });
    });
});
