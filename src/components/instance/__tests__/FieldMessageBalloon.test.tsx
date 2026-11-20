import {cleanup, fireEvent, render, screen, waitFor, within} from "@testing-library/react";
import {afterEach, describe, expect, it, vi} from "vitest";

import {FieldMessageBalloon} from "../FieldMessageBalloon";
import type {LocalString} from "~/hooks/useTranslate";

vi.mock("~/hooks/useTranslate", () => ({
    useTranslate: () => ({
        t: (key: string, options?: {defaultValue?: string}) => options?.defaultValue ?? key,
        l: (value?: LocalString | null) => value?.en,
        i18n: {language: "en"},
    }),
}));

const {getMessages} = vi.hoisted(() => ({
    getMessages: vi.fn(),
}));

vi.mock("~/store/api/messagesApi", () => ({
    messagesEndpoints: {
        getMessages: {
            useQuery: (...args: unknown[]) => getMessages(...args),
        },
        addMessage: {
            useMutation: () => [vi.fn(), {isLoading: false}],
        },
    },
}));

afterEach(cleanup);

describe("FieldMessageBalloon", () => {
    it("renders nothing when allowMessages is false", () => {
        getMessages.mockReturnValue({data: [], isSuccess: true});
        const {container} = render(
            <FieldMessageBalloon
                instanceId="instance-1"
                questionName="Title"
                fieldLabel="Working title"
                allowMessages={false}
                canAdd
                canView
            />,
        );
        expect(container).toBeEmptyDOMElement();
    });

    it.each([
        {notes: "no notes", isClosed: null, icon: "bubble-message-line"},
        {notes: "an open note", isClosed: false, icon: "bubble-message-solid"},
        {notes: "a closed note", isClosed: true, icon: "bubble-message-solid"},
    ])("shows the $icon icon and no count with $notes", async ({isClosed, icon}) => {
        getMessages.mockReturnValue({
            data:
                isClosed === null
                    ? []
                    : [{id: "thread-1", questionName: "Title", isClosed, items: []}],
            isSuccess: true,
        });
        const {container} = render(
            <FieldMessageBalloon
                instanceId="instance-1"
                questionName="Title"
                fieldLabel="Working title"
                allowMessages
                canAdd
                canView
            />,
        );

        const trigger = screen.getByRole("button", {name: "instance.messages.field_label"});
        const svg = trigger.querySelector("svg");
        expect(svg).toHaveAttribute("aria-hidden", "true");
        expect(svg).toHaveClass("ui:text-red-600", "ui:dark:text-red-400");
        expect(container).not.toHaveTextContent(/\d/);
        await waitFor(() =>
            expect(trigger.querySelector("use")).toHaveAttribute("href", `#${icon}`),
        );
        expect(document.getElementById(icon)).toBeInTheDocument();
    });

    it("opens the expanded composer with its configured callout and closes on cancel", () => {
        getMessages.mockReturnValue({data: [], isSuccess: true});
        render(
            <FieldMessageBalloon
                instanceId="instance-1"
                questionName="Title"
                fieldLabel="Working title"
                allowMessages
                canAdd
                canView
                messageUi={{
                    layout: "flat",
                    allowClose: false,
                    callout: true,
                    calloutTitle: {en: "Student privacy", nl: "Privacy van de student"},
                    calloutText: {
                        en: "Avoid identifying details.",
                        nl: "Vermijd herkenbare details.",
                    },
                }}
            />,
        );

        fireEvent.click(screen.getByRole("button", {name: "instance.messages.field_label"}));
        const dialog = within(screen.getByRole("dialog"));
        const input = dialog.getByRole("textbox", {name: "Add a comment"});
        const save = dialog.getByRole("button", {name: "save"});
        const cancel = dialog.getByRole("button", {name: "cancel"});
        const callout = dialog.getByText("Avoid identifying details.");

        expect(input).toHaveAttribute("rows", "3");
        expect(dialog.getByText("Student privacy")).toBeVisible();
        expect(input).toAppearBefore(callout);
        expect(callout).toAppearBefore(save);
        expect(cancel).toHaveClass("ui:bg-white", "ui:border-black");
        expect(save).toBeDisabled();

        fireEvent.change(input, {target: {value: "   "}});
        expect(save).toBeDisabled();
        fireEvent.change(input, {target: {value: "Check this answer"}});
        expect(save).toBeEnabled();

        fireEvent.click(cancel);
        expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    });

    it("hides the new comment composer while replying and restores its draft on cancel", () => {
        getMessages.mockReturnValue({
            data: [
                {
                    id: "thread-1",
                    questionName: "Title",
                    isClosed: false,
                    items: [
                        {
                            id: "comment-1",
                            parentItemId: null,
                            dateTime: "2026-09-17T10:00:00Z",
                            user: {id: "user-1", displayName: "Ada Lovelace"},
                            kind: "Message",
                            body: "An existing comment",
                        },
                    ],
                },
            ],
            isSuccess: true,
        });
        render(
            <FieldMessageBalloon
                instanceId="instance-1"
                questionName="Title"
                fieldLabel="Working title"
                allowMessages
                canAdd
                canView
            />,
        );

        fireEvent.click(screen.getByRole("button", {name: "instance.messages.field_label"}));
        const dialog = within(screen.getByRole("dialog"));
        const newComment = {name: "Add a comment"};
        fireEvent.change(dialog.getByRole("textbox", newComment), {target: {value: "A draft"}});

        fireEvent.click(dialog.getByRole("button", {name: "reply"}));
        expect(dialog.getByRole("textbox", {name: "Write a reply"})).toHaveFocus();
        expect(dialog.queryByRole("textbox", newComment)).not.toBeInTheDocument();

        fireEvent.click(dialog.getByRole("button", {name: "cancel"}));
        expect(dialog.getByRole("textbox", newComment)).toHaveValue("A draft");
    });
});
