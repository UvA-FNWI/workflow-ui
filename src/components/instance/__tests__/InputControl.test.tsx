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

afterEach(cleanup);

describe("InputControl", () => {
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
});
