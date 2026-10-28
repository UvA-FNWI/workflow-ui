import {cleanup, render, screen} from "@testing-library/react";
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
            dateTime: "2026-09-17T10:00:00Z",
            user: {id: "u1", displayName: "Ada Lovelace"},
            body: "Please check the transfer rows.",
            kind: "Message",
        },
        {
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

    it("hides the composer until it is requested", () => {
        render(
            <MessageThreadPanel
                instanceId="instance-1"
                threads={[]}
                canAdd
                composerFirst
                showNewComposer={false}
            />,
        );

        expect(screen.queryByLabelText("instance.messages.placeholder")).toBeNull();
    });

    it("shows the new-conversation composer with a destructive save when requested", () => {
        render(
            <MessageThreadPanel
                instanceId="instance-1"
                threads={[]}
                canAdd
                composerFirst
                showNewComposer
            />,
        );

        expect(screen.getByLabelText("instance.messages.placeholder")).toBeTruthy();
        expect(screen.getByRole("button", {name: "save"})).toBeTruthy();
    });

    it("does not show a new-conversation composer when open conversations exist unless requested", () => {
        render(<MessageThreadPanel instanceId="instance-1" threads={[thread]} canAdd />);

        expect(screen.queryByLabelText("instance.messages.placeholder")).toBeNull();
        expect(screen.getByRole("button", {name: "instance.messages.reply"})).toBeTruthy();
    });

    it("uses buttons for reply and close conversation", () => {
        render(<MessageThreadPanel instanceId="instance-1" threads={[thread]} canAdd />);

        expect(screen.getByRole("button", {name: "instance.messages.reply"})).toBeTruthy();
        expect(
            screen.getByRole("button", {name: "instance.messages.close_conversation"}),
        ).toBeTruthy();
    });

    it("can dismiss the type box with cancel", () => {
        const onDismissComposer = vi.fn();
        render(
            <MessageThreadPanel
                instanceId="instance-1"
                threads={[]}
                canAdd
                composerFirst
                showNewComposer
                onDismissComposer={onDismissComposer}
            />,
        );

        screen.getByRole("button", {name: "cancel"}).click();
        expect(onDismissComposer).toHaveBeenCalledOnce();
    });

    it("starts with closed conversations collapsed", () => {
        const closed: MessageThread = {
            ...thread,
            id: "closed-1",
            isClosed: true,
            items: [
                ...thread.items,
                {
                    dateTime: "2026-09-18T10:00:00Z",
                    user: {id: "u1", displayName: "Ada Lovelace"},
                    kind: "Close",
                },
            ],
        };

        render(<MessageThreadPanel instanceId="instance-1" threads={[closed]} canAdd={false} />);

        expect(screen.queryByText("Will do.")).toBeNull();
        expect(screen.getByText(/Ada Lovelace.*instance\.messages\.closed/)).toBeTruthy();
    });
});
