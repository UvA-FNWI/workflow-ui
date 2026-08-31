import {describe, expect, it} from "vitest";
import {parseDocument} from "yaml";

import {addPage, deletePage, readPages, updatePageTitle} from "../questions";
import type {ConfigDocs} from "../types";

const FORM_PATH = "Definitions/Thesis/Forms/Proposal.yaml";

const form = () =>
    new Map([
        [
            FORM_PATH,
            parseDocument(`name: Proposal
pages:
  - name: Content
    title:
      nl: Inhoud
      en: Content
    fields:
      - WorkingTitle
  - name: Planning
    title: Planning
    fields: []
`),
        ],
    ]) as ConfigDocs;

describe("page mutations", () => {
    it("adds a page with a slugged name and an empty fields list", () => {
        const docs = form();

        expect(addPage(docs, FORM_PATH, "Nieuw tabblad")).toEqual({
            name: "NieuwTabblad",
            touched: [FORM_PATH],
        });
        expect(readPages(docs, FORM_PATH).at(-1)).toEqual({
            name: "NieuwTabblad",
            title: {nl: "Nieuw tabblad", en: "Nieuw tabblad"},
        });
        expect(docs.get(FORM_PATH)?.toString()).toContain("fields: []");
    });

    it("gives a second page of the same title a distinct name", () => {
        const docs = form();

        addPage(docs, FORM_PATH, "Nieuw tabblad");
        expect(addPage(docs, FORM_PATH, "Nieuw tabblad").name).toBe("NieuwTabblad2");
    });

    it("writes one language of the title without dropping the other", () => {
        const docs = form();

        expect(updatePageTitle(docs, FORM_PATH, "Content", "nl", "Onderdelen")).toEqual([
            FORM_PATH,
        ]);
        expect(readPages(docs, FORM_PATH)[0].title).toEqual({nl: "Onderdelen", en: "Content"});
    });

    // A plain string title is legal yaml here, and is the shape that loses its other half silently.
    it("expands a plain string title into both languages", () => {
        const docs = form();

        updatePageTitle(docs, FORM_PATH, "Planning", "en", "Timeline");
        expect(readPages(docs, FORM_PATH)[1].title).toEqual({nl: "Planning", en: "Timeline"});
    });

    it("deletes only the named page, and reports nothing for an unknown one", () => {
        const docs = form();

        expect(deletePage(docs, FORM_PATH, "Content")).toEqual([FORM_PATH]);
        expect(readPages(docs, FORM_PATH).map((page) => page.name)).toEqual(["Planning"]);
        expect(deletePage(docs, FORM_PATH, "Nope")).toEqual([]);
    });
});
