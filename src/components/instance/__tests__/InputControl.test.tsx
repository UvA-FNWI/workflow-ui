import "@testing-library/jest-dom/vitest";
import {cleanup, fireEvent, render, screen, waitFor} from "@testing-library/react";
import {afterEach, describe, expect, it, vi} from "vitest";

import {InputControl} from "../InputControl";
import type {Question} from "~/store/api/types/submissions";
import type {CreateExternalUserInput, UserSearchResult} from "~/store/api/types/users";

vi.mock("~/hooks/useTranslate", () => ({
    useTranslate: () => ({
        t: (key: string) => key,
        l: () => "",
        i18n: {language: "en"},
    }),
}));

vi.mock("~/components/UserPicker/UserPicker", () => ({
    UserPicker: ({
        onCreateExternalUser,
    }: {
        onCreateExternalUser: (user: CreateExternalUserInput) => Promise<void>;
    }) => (
        <button
            type="button"
            onClick={() =>
                void onCreateExternalUser({
                    displayName: "External User",
                    email: "external@example.org",
                })
            }
        >
            Add external user
        </button>
    ),
}));

const question: Question = {
    name: "PracticalSupervisor",
    type: "User",
    text: {en: "Practical supervisor", nl: "Praktijkbegeleider"},
    weight: null,
    percentage: null,
    isRequired: true,
    isArray: true,
    hideInResults: false,
    allowsExternalUsers: true,
    choices: [],
};

const existingUser: UserSearchResult = {
    id: "user-1",
    userName: "internal-user",
    displayName: "Internal User",
    email: "internal@example.org",
    isExternal: false,
    isPending: false,
};

afterEach(() => {
    cleanup();
    vi.useRealTimers();
});

describe("InputControl", () => {
    it("saves the latest pending text value once when unmounted", () => {
        vi.useFakeTimers();
        const textQuestion: Question = {
            name: "Comments",
            type: "String",
            text: {en: "Comments", nl: "Opmerkingen"},
            weight: null,
            percentage: null,
            isRequired: false,
            isArray: false,
            hideInResults: false,
            allowsExternalUsers: false,
            choices: [],
        };
        const onSave = vi.fn().mockResolvedValue({});
        const {unmount} = render(<InputControl question={textQuestion} value="" onSave={onSave} />);
        const input = screen.getByRole("textbox");

        fireEvent.change(input, {target: {value: "draft"}});
        fireEvent.change(input, {target: {value: "final"}});
        unmount();
        vi.runAllTimers();

        expect(onSave).toHaveBeenCalledTimes(1);
        expect(onSave).toHaveBeenCalledWith({questionName: "Comments", value: "final"});
    });

    it("includes the current user array when creating an external user", async () => {
        const onSaveExternalUser = vi.fn().mockResolvedValue({
            answers: [{questionName: question.name, value: [existingUser]}],
        });

        render(
            <InputControl
                value={[existingUser]}
                question={question}
                onSaveExternalUser={onSaveExternalUser}
            />,
        );

        fireEvent.click(screen.getByRole("button", {name: "Add external user"}));

        await waitFor(() =>
            expect(onSaveExternalUser).toHaveBeenCalledWith({
                questionName: question.name,
                value: [existingUser],
                externalUser: {
                    displayName: "External User",
                    email: "external@example.org",
                },
            }),
        );
    });

    it("renders a combobox instead of radios when choice layout is ComboBox", () => {
        const country: Question = {
            name: "Country",
            type: "Choice",
            text: {en: "Country", nl: "Land"},
            weight: null,
            percentage: null,
            isRequired: true,
            isArray: false,
            hideInResults: false,
            allowsExternalUsers: false,
            choices: [{name: "NL", text: {en: "Netherlands", nl: "Nederland"}}],
            layout: {type: "ComboBox"},
        };

        render(<InputControl question={country} />);

        expect(screen.getByRole("combobox")).toBeInTheDocument();
        expect(screen.queryByRole("radio")).not.toBeInTheDocument();
    });
});
