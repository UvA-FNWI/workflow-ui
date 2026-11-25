import {describe, expect, it} from "vitest";
import {parseDocument} from "yaml";

import {
    addPage,
    addQuestion,
    deletePage,
    elementsSeq,
    readPages,
    removeField,
    reorderElements,
    updatePageTitle,
} from "../questions";
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
    elements:
      - question: WorkingTitle
  - name: Planning
    title: Planning
    elements: []
`),
        ],
    ]) as ConfigDocs;

describe("page mutations", () => {
    it("moves a conditional callout together with its content", () => {
        const docs = form();
        const doc = docs.get(FORM_PATH)!;
        const elements = elementsSeq(doc, "Content")!;
        const callout = {
            callout: {title: "Read first", condition: {value: {property: "WorkingTitle"}}},
        };
        elements.add(doc.createNode({text: "Help"}));
        elements.add(doc.createNode(callout));

        expect(reorderElements(docs, FORM_PATH, "Content", 2, 0)).toEqual([FORM_PATH]);
        expect(elements.toJSON()).toEqual([callout, {question: "WorkingTitle"}, {text: "Help"}]);
    });

    it("adds a page with a slugged name and an empty elements list", () => {
        const docs = form();

        expect(addPage(docs, FORM_PATH, "Nieuw tabblad")).toEqual({
            name: "NieuwTabblad",
            touched: [FORM_PATH],
        });
        expect(readPages(docs, FORM_PATH).at(-1)).toEqual({
            name: "NieuwTabblad",
            title: {nl: "Nieuw tabblad", en: "Nieuw tabblad"},
        });
        expect(docs.get(FORM_PATH)?.toString()).toContain("elements: []");
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

    it("discards an unsaved question only after its last reference is removed", () => {
        const docs = form();
        const definitionPath = "Definitions/Thesis/Entity.yaml";
        docs.set(
            definitionPath,
            parseDocument("name: Thesis\nproperties: [{name: WorkingTitle, type: String}]"),
        );
        const originalDefinition = docs.get(definitionPath)!.toString();
        const originalForm = docs.get(FORM_PATH)!.toString();
        addPage(docs, FORM_PATH, "Additional tab");
        const {name} = addQuestion(
            docs,
            FORM_PATH,
            "AdditionalTab",
            "TextField",
            "Unsaved question",
        );
        const doc = docs.get(FORM_PATH)!;
        elementsSeq(doc, "Planning")!.add(doc.createNode({question: name}));

        expect(deletePage(docs, FORM_PATH, "AdditionalTab")).toEqual([FORM_PATH]);
        expect(docs.get(definitionPath)!.toString()).toContain(name);
        expect(removeField(docs, FORM_PATH, "Planning", name)).toEqual([FORM_PATH, definitionPath]);
        expect(docs.get(definitionPath)!.toString()).toBe(originalDefinition);
        expect(docs.get(FORM_PATH)!.toString()).toBe(originalForm);
    });
});
