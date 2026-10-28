import {cleanup, fireEvent, render, screen} from "@testing-library/react";
import {afterEach, describe, expect, it, vi} from "vitest";

import {MessageThreadPanel} from "../MessageThreadPanel";
import type {MessageThread} from "~/store/api/types/messages";

vi.mock("~/hooks/useTranslate", () => ({
    useTranslate: () => ({
        t: (key: string) => key,
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

describe("MessageThreadPanel", () => {
    it("shows the author before reply text in the reply rail", () => {
        render(<MessageThreadPanel instanceId="instance-1" threads={[thread]} canAdd={false} />);

        const reply = screen.getByText("Will do.");
        const author = screen.getByText("Grace Hopper");
        expect(
            author.compareDocumentPosition(reply) & Node.DOCUMENT_POSITION_FOLLOWING,
        ).toBeTruthy();
    });

    it("shows a compact new-conversation field without actions until it is focused", () => {
        render(<MessageThreadPanel instanceId="instance-1" threads={[thread]} canAdd />);

        expect(
            screen.getByLabelText("instance.messages.new_conversation_placeholder"),
        ).toBeTruthy();
        expect(screen.queryByRole("button", {name: "save"})).toBeNull();
    });

    it("shows a compact new-conversation field when there are no threads", () => {
        render(<MessageThreadPanel instanceId="instance-1" threads={[]} canAdd />);

        expect(
            screen.getByLabelText("instance.messages.new_conversation_placeholder"),
        ).toBeTruthy();
        expect(screen.queryByRole("button", {name: "save"})).toBeNull();
        fireEvent.focus(screen.getByLabelText("instance.messages.new_conversation_placeholder"));
        expect(screen.getByRole("button", {name: "save"})).toBeTruthy();
    });

    it("does not show save on the new conversation until it is expanded", () => {
        render(<MessageThreadPanel instanceId="instance-1" threads={[thread]} canAdd />);

        expect(screen.queryByRole("button", {name: "save"})).toBeNull();
        fireEvent.focus(screen.getByLabelText("instance.messages.new_conversation_placeholder"));
        expect(screen.getByRole("button", {name: "save"})).toBeTruthy();
    });

    it("uses buttons for reply and close conversation", () => {
        render(<MessageThreadPanel instanceId="instance-1" threads={[thread]} canAdd />);

        expect(
            screen.getAllByRole("button", {name: "instance.messages.reply"}).length,
        ).toBeGreaterThan(0);
        expect(
            screen.getByRole("button", {name: "instance.messages.close_conversation"}),
        ).toBeTruthy();
    });

    it("can dismiss the new conversation field with cancel", () => {
        render(<MessageThreadPanel instanceId="instance-1" threads={[thread]} canAdd />);

        fireEvent.focus(screen.getByLabelText("instance.messages.new_conversation_placeholder"));
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
        expect(screen.getByText(/Ada Lovelace.*instance\.messages\.closed/)).toBeTruthy();
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
