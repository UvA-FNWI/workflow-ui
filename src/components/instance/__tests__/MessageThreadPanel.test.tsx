import {cleanup, fireEvent, render, screen} from "@testing-library/react";
import {afterEach, describe, expect, it, vi} from "vitest";

import {defaultMessageUi} from "../instanceMessageSettings";
import {MessageThreadPanel} from "../MessageThreadPanel";
import type {LocalString} from "~/hooks/useTranslate";
import type {MessageThread} from "~/store/api/types/messages";
import {formatDate} from "~/utils/formatDate";

vi.mock("~/hooks/useTranslate", () => ({
    useTranslate: (_ns?: string, options?: {keyPrefix?: string}) => ({
        t: (key: string, translateOptions?: {defaultValue?: string}) => {
            if (translateOptions?.defaultValue) return translateOptions.defaultValue;
            const prefix = options?.keyPrefix ? `${options.keyPrefix}.` : "";
            return `${prefix}${key}`;
        },
        l: (value?: LocalString | null) => value?.en,
        i18n: {language: "en"},
    }),
}));

vi.mock("~/store/api/messagesApi", () => ({
    messagesEndpoints: {
        addMessage: {
            useMutation: () => [vi.fn(), {isLoading: false}],
        },
    },
}));

afterEach(cleanup);

const thread: MessageThread = {
    id: "thread-1",
    questionName: null,
    isClosed: false,
    items: [
        {
            id: "item-root",
            parentItemId: null,
            dateTime: "2026-09-17T10:00:00Z",
            user: {id: "u1", displayName: "Ada Lovelace"},
            body: "Please check the transfer rows.",
            kind: "Message",
        },
        {
            id: "item-reply",
            parentItemId: "item-root",
            dateTime: "2026-09-17T11:00:00Z",
            user: {id: "u2", displayName: "Grace Hopper"},
            body: "Will do.",
            kind: "Message",
        },
    ],
};

const replyAction = {name: "instance.messages.reply"};

describe("MessageThreadPanel", () => {
    it("shows flat messages newest first", () => {
        render(
            <MessageThreadPanel
                instanceId="instance-1"
                threads={[thread]}
                canAdd={false}
                messageUi={{...defaultMessageUi, layout: "flat", allowClose: false}}
            />,
        );

        expect(screen.getByText("Will do.")).toAppearBefore(
            screen.getByText("Please check the transfer rows."),
        );
    });

    it("shows open conversations first and sorts each status by newest opener", () => {
        const conversation = (
            id: string,
            displayName: string,
            dateTime: string,
            isClosed: boolean,
        ): MessageThread => ({
            ...thread,
            id,
            isClosed,
            items: [
                {
                    ...thread.items[0]!,
                    id: `${id}-root`,
                    dateTime,
                    user: {id, displayName},
                },
            ],
        });
        const olderClosed = conversation(
            "older-closed",
            "Margaret Hamilton",
            "2026-09-17T10:15:00Z",
            true,
        );
        const newerClosed = conversation(
            "newer-closed",
            "Katherine Johnson",
            "2026-09-17T11:30:00Z",
            true,
        );
        const newerOpen = conversation("newer-open", "Alan Turing", "2026-09-17T10:30:00Z", false);

        render(
            <MessageThreadPanel
                instanceId="instance-1"
                threads={[olderClosed, thread, newerClosed, newerOpen]}
                canAdd={false}
            />,
        );

        expect(screen.getByText("Alan Turing")).toAppearBefore(screen.getByText("Ada Lovelace"));
        expect(screen.getByText("Ada Lovelace")).toAppearBefore(
            screen.getByText("Katherine Johnson"),
        );
        expect(screen.getByText("Katherine Johnson")).toAppearBefore(
            screen.getByText("Margaret Hamilton"),
        );
    });

    it("shows the timestamp next to the reply author before the reply text", () => {
        render(<MessageThreadPanel instanceId="instance-1" threads={[thread]} canAdd={false} />);

        const reply = screen.getByText("Will do.");
        const author = screen.getByText("Grace Hopper");
        const formattedDate = formatDate(thread.items[1]!.dateTime, "en");
        const timestamp = screen.getByText(formattedDate, {selector: "time"});
        expect(timestamp).toBeVisible();
        expect(author.parentElement).toHaveTextContent(`Grace Hopper · ${formattedDate}`);
        expect(timestamp).toAppearBefore(reply);
    });

    it("shows a compact new-conversation field without actions until it is focused", () => {
        render(<MessageThreadPanel instanceId="instance-1" threads={[thread]} canAdd />);

        expect(screen.getByLabelText("Add a comment")).toBeTruthy();
        expect(screen.queryByRole("button", {name: "save"})).toBeNull();
    });

    it("shows a compact new-conversation field when there are no threads", () => {
        render(<MessageThreadPanel instanceId="instance-1" threads={[]} canAdd />);

        expect(screen.getByLabelText("Add a comment")).toBeTruthy();
        expect(screen.queryByRole("button", {name: "save"})).toBeNull();
        fireEvent.focus(screen.getByLabelText("Add a comment"));
        expect(screen.getByRole("button", {name: "save"})).toBeTruthy();
    });

    it("does not show save on the new conversation until it is expanded", () => {
        render(<MessageThreadPanel instanceId="instance-1" threads={[thread]} canAdd />);

        expect(screen.queryByRole("button", {name: "save"})).toBeNull();
        fireEvent.focus(screen.getByLabelText("Add a comment"));
        expect(screen.getByRole("button", {name: "save"})).toBeTruthy();
    });

    it("opens a focused reply composer with its configured callout on click", () => {
        render(
            <MessageThreadPanel
                instanceId="instance-1"
                threads={[thread]}
                canAdd
                showNewComposer={false}
                messageUi={{
                    ...defaultMessageUi,
                    callout: {
                        variant: "Info",
                        title: {en: "Student privacy", nl: "Privacy van de student"},
                        text: {
                            en: "Avoid identifying details.",
                            nl: "Vermijd herkenbare details.",
                        },
                    },
                }}
            />,
        );

        const [rootReply, nestedReply] = screen.getAllByRole("button", replyAction);
        fireEvent.focus(rootReply!);
        expect(screen.queryByRole("textbox", {name: "Write a reply"})).toBeNull();
        fireEvent.click(rootReply!);

        const input = screen.getByRole("textbox", {name: "Write a reply"});
        const save = screen.getByRole("button", {name: "save"});
        const cancel = screen.getByRole("button", {name: "cancel"});
        const callout = screen.getByText("Avoid identifying details.");
        expect(screen.getByRole("button", replyAction)).toBe(nestedReply);
        expect(input).toHaveFocus();
        expect(screen.getByText("Student privacy")).toBeVisible();
        expect(callout.closest(".ui\\:border-l-4")).toHaveClass("ui:border-l-navy-600");
        expect(input).toAppearBefore(callout);
        expect(callout).toAppearBefore(save);
        expect(save).toBeDisabled();

        fireEvent.change(input, {target: {value: "   "}});
        expect(save).toBeDisabled();
        fireEvent.change(input, {target: {value: "I will check"}});
        expect(save).toBeEnabled();

        fireEvent.click(cancel);
        expect(screen.queryByRole("textbox", {name: "Write a reply"})).toBeNull();
        expect(screen.getAllByRole("button", replyAction)).toHaveLength(2);
    });

    it("keeps the reply text when another reply is opened", () => {
        render(<MessageThreadPanel instanceId="instance-1" threads={[thread]} canAdd />);

        const replyField = () => screen.getByRole("textbox", {name: "Write a reply"});
        fireEvent.click(screen.getAllByRole("button", replyAction)[0]!);
        fireEvent.change(replyField(), {target: {value: "Keep this"}});
        fireEvent.click(screen.getByRole("button", replyAction));

        expect(replyField()).toHaveValue("");

        fireEvent.click(screen.getByRole("button", replyAction));
        expect(replyField()).toHaveValue("Keep this");
    });

    it("shows inline reply starters and a close conversation button", () => {
        render(<MessageThreadPanel instanceId="instance-1" threads={[thread]} canAdd />);

        expect(screen.getAllByRole("button", replyAction)).toHaveLength(2);
        expect(
            screen.getByRole("button", {name: "instance.messages.close_conversation"}),
        ).toBeTruthy();
    });

    it("can dismiss the new conversation field with cancel", () => {
        render(<MessageThreadPanel instanceId="instance-1" threads={[thread]} canAdd />);

        fireEvent.focus(screen.getByLabelText("Add a comment"));
        expect(screen.getByRole("button", {name: "save"})).toBeTruthy();
        fireEvent.click(screen.getByRole("button", {name: "cancel"}));
        expect(screen.queryByRole("button", {name: "save"})).toBeNull();
    });

    it("starts with closed conversations collapsed", () => {
        const closed: MessageThread = {
            ...thread,
            id: "closed-1",
            isClosed: true,
            items: [
                thread.items[0],
                {
                    dateTime: "2026-09-18T10:00:00Z",
                    user: {id: "u1", displayName: "Ada Lovelace"},
                    kind: "Close",
                    id: "close-1",
                    parentItemId: null,
                    body: null,
                },
            ],
        };

        render(<MessageThreadPanel instanceId="instance-1" threads={[closed]} canAdd={false} />);

        expect(screen.queryByText("Will do.")).toBeNull();
        expect(screen.getByText("Ada Lovelace")).toBeTruthy();
        expect(screen.getByText("instance.messages.closed")).toBeTruthy();
    });

    it("shows reopen only on an expanded closed conversation", () => {
        const closed: MessageThread = {
            ...thread,
            id: "closed-1",
            isClosed: true,
            items: [
                thread.items[0],
                {
                    dateTime: "2026-09-18T10:00:00Z",
                    user: {id: "u1", displayName: "Ada Lovelace"},
                    kind: "Close",
                    id: "close-1",
                    parentItemId: null,
                    body: null,
                },
            ],
        };

        render(<MessageThreadPanel instanceId="instance-1" threads={[closed]} canAdd />);

        expect(
            screen.queryByRole("button", {name: "instance.messages.reopen_conversation"}),
        ).toBeNull();

        fireEvent.click(
            screen.getByRole("button", {name: "instance.messages.expand_conversation"}),
        );
        expect(
            screen.getByRole("button", {name: "instance.messages.reopen_conversation"}),
        ).toBeTruthy();
    });
});
