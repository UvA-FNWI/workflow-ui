import "@testing-library/jest-dom/vitest";
import {cleanup, fireEvent, render, screen} from "@testing-library/react";
import {afterEach, describe, expect, it, vi} from "vitest";

import {UserPicker} from "../UserPicker";
import type {UserSearchResult} from "~/store/api/types/users.ts";

vi.mock("~/hooks/useTranslate", () => ({
    useTranslate: () => ({
        t: (key: string) => key,
    }),
}));

vi.mock("../UserPickerModal", () => ({
    UserPickerModal: ({
        isOpen,
        initialSelection,
        selectionMode,
        onConfirm,
    }: {
        isOpen: boolean;
        initialSelection?: UserSearchResult[];
        selectionMode?: "single" | "multiple";
        onConfirm: (users: UserSearchResult[]) => void;
    }) =>
        isOpen ? (
            <div
                role="dialog"
                data-selection-mode={selectionMode}
                data-selected-users={initialSelection?.map((user) => user.email).join(",")}
            >
                User picker
                <button
                    type="button"
                    onClick={() =>
                        onConfirm([
                            {
                                id: "user-3",
                                userName: "katherine",
                                displayName: "Katherine Johnson",
                                email: "katherine@example.com",
                                isExternal: false,
                                isPending: false,
                            },
                        ])
                    }
                >
                    Choose Katherine
                </button>
            </div>
        ) : null,
}));

vi.mock("~/components/instance/AddExternalUserModal.tsx", () => ({
    AddExternalUserModal: ({isOpen}: {isOpen: boolean}) =>
        isOpen ? <div role="dialog">External user editor</div> : null,
}));

const internalUser: UserSearchResult = {
    id: "user-1",
    userName: "ada",
    displayName: "Ada Lovelace",
    email: "ada@example.com",
    isExternal: false,
    isPending: false,
};

const externalUser: UserSearchResult = {
    id: "user-2",
    userName: "grace@example.org",
    displayName: "Grace Hopper",
    email: "grace@example.org",
    isExternal: true,
    isPending: false,
};

const renderMultiplePicker = (
    value: UserSearchResult | UserSearchResult[],
    options: {
        isRequired?: boolean;
        onChange?: (users: UserSearchResult | UserSearchResult[] | null) => void;
    } = {},
) => {
    const onChange = options.onChange ?? vi.fn();
    return {
        onChange,
        ...render(
            <UserPicker
                value={value}
                selectionMode="multiple"
                isRequired={options.isRequired}
                onChange={onChange}
                allowsExternalUsers
                onCreateExternalUser={vi.fn()}
            />,
        ),
    };
};

afterEach(cleanup);

describe("UserPicker", () => {
    it("renders selected users as removable tags", () => {
        const {onChange} = renderMultiplePicker([internalUser, externalUser]);

        expect(screen.getByText("Ada Lovelace | ada@example.com")).toBeInTheDocument();
        expect(screen.getByText("Grace Hopper | grace@example.org")).toBeInTheDocument();

        const input = screen.getByRole("combobox", {name: "add"});
        expect(input).toHaveAttribute("readonly");

        fireEvent.click(
            screen.getByRole("button", {name: "Remove Ada Lovelace | ada@example.com"}),
        );
        expect(onChange).toHaveBeenCalledWith([externalUser]);
    });

    it("allows removal down to one tag when the user array is required", () => {
        const {onChange, rerender} = renderMultiplePicker([internalUser, externalUser], {
            isRequired: true,
        });

        fireEvent.click(
            screen.getByRole("button", {name: "Remove Ada Lovelace | ada@example.com"}),
        );
        expect(onChange).toHaveBeenCalledWith([externalUser]);

        rerender(
            <UserPicker
                value={[externalUser]}
                selectionMode="multiple"
                isRequired
                onChange={onChange}
                allowsExternalUsers
                onCreateExternalUser={vi.fn()}
            />,
        );

        expect(screen.queryByRole("button", {name: /^Remove /})).not.toBeInTheDocument();
    });

    it("opens a clean single-user picker from the Add input", () => {
        renderMultiplePicker([internalUser, externalUser]);
        const input = screen.getByRole("combobox", {name: "add"});

        fireEvent.keyDown(input, {key: "A"});
        expect(input).toHaveValue("");

        fireEvent.click(screen.getByText("Ada Lovelace | ada@example.com"));
        expect(screen.queryByText("User picker")).not.toBeInTheDocument();

        fireEvent.click(input);

        const dialog = screen.getByText("User picker");
        expect(dialog).toHaveAttribute("data-selection-mode", "single");
        expect(dialog).toHaveAttribute("data-selected-users", "");
    });

    it("appends the picked user to the existing tags", () => {
        const {onChange} = renderMultiplePicker([internalUser]);

        fireEvent.click(screen.getByRole("combobox", {name: "add"}));
        fireEvent.click(screen.getByRole("button", {name: "Choose Katherine"}));

        expect(onChange).toHaveBeenCalledWith([
            internalUser,
            expect.objectContaining({userName: "katherine"}),
        ]);
    });

    it("opens the clean add picker with Enter", () => {
        renderMultiplePicker([internalUser]);

        fireEvent.keyDown(screen.getByRole("combobox", {name: "add"}), {key: "Enter"});

        expect(screen.getByText("User picker")).toBeInTheDocument();
    });

    it("uses the clean add picker for an existing external-user tag", () => {
        renderMultiplePicker(externalUser);

        fireEvent.click(screen.getByRole("combobox", {name: "add"}));

        const dialog = screen.getByText("User picker");
        expect(dialog).toHaveAttribute("data-selection-mode", "single");
        expect(dialog).toHaveAttribute("data-selected-users", "");
        expect(screen.queryByText("External user editor")).not.toBeInTheDocument();
    });
});
