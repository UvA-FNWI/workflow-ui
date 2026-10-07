import {useState} from "react";

import "@testing-library/jest-dom/vitest";
import {cleanup, fireEvent, render, screen, waitFor} from "@testing-library/react";
import {afterEach, describe, expect, it, vi} from "vitest";

import {InputControl} from "../InputControl";
import type {Question} from "~/store/api/types/submissions";

vi.mock("~/hooks/useTranslate", () => ({
    useTranslate: () => ({
        t: (key: string) => key,
        l: (value?: {en: string}) => value?.en,
        i18n: {language: "en"},
    }),
}));

const question: Question = {
    name: "OralTest",
    type: "Choice",
    text: {en: "Oral test", nl: "Mondelinge toets"},
    weight: 1,
    percentage: null,
    isRequired: false,
    isArray: false,
    hideInResults: false,
    allowsExternalUsers: false,
    choices: [{name: "7", text: {en: "7", nl: "7"}}],
    layout: {type: "Rubric"},
    rubric: [
        {
            name: "Good",
            description: {en: "Good performance", nl: "Goede prestatie"},
            grades: [{name: "7", text: {en: "7", nl: "7"}}],
        },
    ],
};

afterEach(cleanup);

describe("optional rubric", () => {
    it("clears from the button beside the input and allows selecting a grade again", async () => {
        const onSave = vi.fn().mockResolvedValue({});
        function Form() {
            const [value, setValue] = useState<unknown>("7");
            return (
                <InputControl
                    question={question}
                    value={value}
                    onChange={setValue}
                    onSave={onSave}
                />
            );
        }
        render(<Form />);
        const clear = screen.getByRole("button", {name: "clear_selection"});
        const trigger = screen.getAllByRole("button").find((button) => button !== clear)!;
        expect(screen.queryByRole("listbox")).not.toBeInTheDocument();
        fireEvent.click(clear);
        await waitFor(() =>
            expect(onSave).toHaveBeenCalledWith({questionName: "OralTest", value: null}),
        );
        expect(screen.queryByRole("listbox")).not.toBeInTheDocument();
        expect(trigger).toHaveFocus();
        expect(trigger).toHaveTextContent("select");
        expect(screen.queryByRole("button", {name: "clear_selection"})).not.toBeInTheDocument();
        fireEvent.click(trigger);
        fireEvent.click(await screen.findByRole("option", {name: "7"}));
        expect(onSave).toHaveBeenLastCalledWith({questionName: "OralTest", value: "7"});
        expect(screen.getByRole("button", {name: "clear_selection"})).toBeInTheDocument();
        fireEvent.click(trigger);
        await screen.findByRole("option", {name: "7"});
        expect(screen.queryByRole("option", {name: "clear_selection"})).not.toBeInTheDocument();
    });

    it("does not offer × for required rubric questions", async () => {
        render(<InputControl question={{...question, isRequired: true}} value="7" />);
        expect(screen.queryByRole("button", {name: "clear_selection"})).not.toBeInTheDocument();
        fireEvent.click(screen.getByRole("button"));
        await screen.findByRole("option", {name: "7"});
        expect(screen.queryByRole("option", {name: "clear_selection"})).not.toBeInTheDocument();
    });
});
