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
                cardTitle: null,
                layout: "threaded",
                allowClose: true,
                callout: null,
                term: null,
                termPlural: null,
            },
        );
    });

    it("honours explicit settings from the API", () => {
        const term = {en: "review note", nl: "beoordelingsnotitie"};
        const termPlural = {en: "review notes", nl: "beoordelingsnotities"};

        expect(
            resolveInstanceMessageSettings({
                name: "X",
                messagesEnabled: true,
                messages: {
                    card: false,
                    cardTitle: {en: "Notes", nl: "Notities"},
                    layout: "flat",
                    allowClose: false,
                    callout: {
                        variant: "Warning",
                        title: {en: "Privacy", nl: "Privacy"},
                        text: {en: "Body", nl: "Tekst"},
                    },
                    term,
                    termPlural,
                    fieldsAllowAll: false,
                },
            } as never),
        ).toEqual({
            card: false,
            cardTitle: {en: "Notes", nl: "Notities"},
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
