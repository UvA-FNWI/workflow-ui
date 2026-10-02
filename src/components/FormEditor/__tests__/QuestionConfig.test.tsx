import {initReactI18next} from "react-i18next";

// The setup file loads these matchers at runtime; importing here is what types them.
import "@testing-library/jest-dom/vitest";
import {cleanup, fireEvent, render, screen} from "@testing-library/react";
import i18next from "i18next";
import {afterEach, beforeAll, describe, expect, it} from "vitest";
import {parseDocument} from "yaml";

import type {ConfigDocs} from "../model";
import {readQuestions, updateQuestion} from "../model";
import {QuestionConfig} from "../QuestionConfig";

const FORM_PATH = "Definitions/Thesis/Forms/Proposal.yaml";

/** Keys render as themselves, which is enough to tell which controls are on screen. */
beforeAll(async () => {
    await i18next.use(initReactI18next).init({lng: "nl", resources: {}});
});

// vitest runs without globals here, so Testing Library's automatic cleanup never registers.
afterEach(cleanup);

const renderConfig = (properties: string) => {
    const docs = new Map([
        [
            FORM_PATH,
            parseDocument(`name: Proposal
pages:
  - name: Content
    elements:
      - question: Question
`),
        ],
        ["Definitions/Thesis/Entity.yaml", parseDocument(`name: Thesis\n${properties}`)],
    ]) as ConfigDocs;
    const [question] = readQuestions(docs, FORM_PATH, "Content");
    render(
        <QuestionConfig
            docs={docs}
            formPath={FORM_PATH}
            question={question}
            isDisabled={false}
            apply={() => {}}
        />,
    );
    return question;
};

describe("QuestionConfig", () => {
    it("keeps commas and spaces while typing file formats", () => {
        renderConfig(`properties:
  - name: Question
    type: File
    allowedFileTypes: [pdf]
`);
        const input = screen.getByRole("textbox", {name: "allowed_file_types"});
        for (const value of ["pdf,", "pdf, ", "pdf, z", "pdf, zi", "pdf, zip"]) {
            fireEvent.change(input, {target: {value}});
            expect(input).toHaveValue(value);
        }
        fireEvent.blur(input);
    });

    it("offers the layout advice only for a single choice question", () => {
        const question = renderConfig(`properties:
  - name: Question
    type: Question
    text: {nl: Vraag, en: Question}
    values:
      - name: One
        text: {nl: Een, en: One}
    layout: {type: RadioList}
`);

        expect(question.kind).toBe("SingleChoice");
        expect(screen.getByText("choice_layout_hint")).toBeInTheDocument();
        expect(screen.getByRole("radio", {name: "layout.RadioList"})).toBeChecked();
    });

    it("leaves the type out of the body, since the pill in the header owns it", () => {
        renderConfig(`properties:
  - name: Question
    type: String
    text: {nl: Vraag, en: Question}
`);

        expect(screen.queryByText("choice_layout_hint")).not.toBeInTheDocument();
        expect(screen.queryByLabelText("type")).not.toBeInTheDocument();
        expect(screen.getByText("more_options")).toBeInTheDocument();
    });

    it("edits a multi-file question without losing its file constraints", () => {
        const properties = `properties:
  - name: Question
    type: '[File]'
    text: {nl: Bijlagen, en: Attachments}
    allowedFileTypes: ['*']
    allowedFileSize: 1000
`;
        const question = renderConfig(properties);
        expect(question.kind).toBe("Document");
        expect(screen.getByRole("checkbox", {name: "multiple_files"})).toBeChecked();
        expect(screen.getByRole("textbox", {name: "allowed_file_types"})).toHaveValue("*");

        const docs = new Map([
            [FORM_PATH, parseDocument("name: Proposal\npages: []")],
            ["Definitions/Thesis/Entity.yaml", parseDocument(`name: Thesis\n${properties}`)],
        ]) as ConfigDocs;
        updateQuestion(docs, FORM_PATH, "Question", {isArray: false, allowedFileTypes: "pdf, zip"});
        const raw = docs.get("Definitions/Thesis/Entity.yaml")!.toJSON().properties[0];
        expect(raw.type).toBe("File");
        expect(raw.allowedFileTypes).toEqual(["pdf", "zip"]);
        expect(raw.allowedFileSize).toBe(1000);

        updateQuestion(docs, FORM_PATH, "Question", {isArray: true, isRequired: true});
        expect(docs.get("Definitions/Thesis/Entity.yaml")!.toJSON().properties[0].type).toBe(
            "[File]!",
        );
        updateQuestion(docs, FORM_PATH, "Question", {isRequired: false});
        expect(docs.get("Definitions/Thesis/Entity.yaml")!.toJSON().properties[0].type).toBe(
            "[File]",
        );
        updateQuestion(docs, FORM_PATH, "Question", {isArray: false});
        expect(docs.get("Definitions/Thesis/Entity.yaml")!.toJSON().properties[0].type).toBe(
            "File",
        );
    });
});
