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
                layout: "threaded",
                allowClose: true,
                callout: null,
                term: null,
                termPlural: null,
            },
        );
    });

    it("uses workflow settings and terms for field messages without a card", () => {
        const term = {en: "review note", nl: "beoordelingsnotitie"};
        const termPlural = {en: "review notes", nl: "beoordelingsnotities"};

        expect(
            resolveInstanceMessageSettings({
                name: "X",
                messagesEnabled: true,
                messages: {
                    layout: "flat",
                    allowClose: false,
                    callout: {
                        variant: "Warning",
                        title: {en: "Privacy", nl: "Privacy"},
                        text: {en: "Body", nl: "Tekst"},
                    },
                    fieldsAllowAll: false,
                    term,
                    termPlural,
                },
            } as never),
        ).toEqual({
            layout: "flat",
            allowClose: false,
            callout: {
                variant: "Warning",
                title: {en: "Privacy", nl: "Privacy"},
                text: {en: "Body", nl: "Tekst"},
            },
            term,
            termPlural,
        });
    });
});
