import {initReactI18next} from "react-i18next";

// The setup file loads these matchers at runtime; importing here is what types them.
import "@testing-library/jest-dom/vitest";
import {cleanup, render, screen} from "@testing-library/react";
import i18next from "i18next";
import {afterEach, beforeAll, describe, expect, it} from "vitest";
import {parseDocument} from "yaml";

import type {ConfigDocs} from "../model";
import {readQuestions} from "../model";
import {QuestionCard} from "../QuestionCard";

const FORM_PATH = "Definitions/Thesis/Forms/Proposal.yaml";
const FORM = `name: Proposal
pages:
  - name: Content
    fields:
      - Question
`;

beforeAll(async () => {
    await i18next.use(initReactI18next).init({lng: "nl", resources: {}});
});

// vitest runs without globals here, so Testing Library's automatic cleanup never registers.
afterEach(cleanup);

function renderCard(entities: Record<string, string>) {
    const docs = new Map([
        [FORM_PATH, parseDocument(FORM)],
        ...Object.entries(entities).map(
            ([path, text]) =>
                [path, parseDocument(text)] as [string, ReturnType<typeof parseDocument>],
        ),
    ]) as ConfigDocs;
    const [question] = readQuestions(docs, FORM_PATH, "Content");
    render(
        <QuestionCard
            docs={docs}
            formPath={FORM_PATH}
            pageName="Content"
            question={question}
            apply={() => {}}
        />,
    );
}

const TEXT_QUESTION = `name: Thesis
inheritsFrom: Base
properties:
  - name: Question
    type: String
    text: {nl: Vraag, en: Question}
`;

describe("QuestionCard", () => {
    it("makes the type pill the control that changes the type", () => {
        renderCard({"Definitions/Thesis/Entity.yaml": TEXT_QUESTION});

        const pill = screen.getByRole("button", {name: /change_type/});
        expect(pill).toHaveAttribute("aria-haspopup", "dialog");
    });

    it("leaves the pill inert for a question owned by an ancestor definition", () => {
        renderCard({
            "Definitions/Thesis/Entity.yaml": "name: Thesis\ninheritsFrom: Base\n",
            "Definitions/Base/Entity.yaml": `name: Base
properties:
  - name: Question
    type: String
    text: {nl: Vraag, en: Question}
`,
        });

        expect(screen.queryByRole("button", {name: /change_type/})).toBeNull();
        expect(screen.getByText("inherited_short")).toBeInTheDocument();
    });
});
