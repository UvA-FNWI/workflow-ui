import {initReactI18next} from "react-i18next";

// The setup file loads these matchers at runtime; importing here is what types them.
import "@testing-library/jest-dom/vitest";
import {cleanup, render, screen} from "@testing-library/react";
import i18next from "i18next";
import {afterEach, beforeAll, describe, expect, it} from "vitest";
import {parseDocument} from "yaml";

import type {ConfigDocs} from "../model";
import {readQuestions} from "../model";
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
    fields:
      - Question
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
});
