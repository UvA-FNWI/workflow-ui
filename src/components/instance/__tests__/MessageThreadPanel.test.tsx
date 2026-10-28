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
    ],
};

describe("MessageThreadPanel", () => {
    it("shows the note text before the author and datetime", () => {
        render(<MessageThreadPanel instanceId="instance-1" threads={[thread]} canAdd={false} />);

        const text = screen.getByText("Please check the transfer rows.");
        const author = screen.getByText("Ada Lovelace");
        expect(
            text.compareDocumentPosition(author) & Node.DOCUMENT_POSITION_FOLLOWING,
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
        expect(screen.queryByText("instance.messages.mail_callout")).toBeNull();
    });

    it("places the callout after the note box and uses a destructive save", () => {
        render(
            <MessageThreadPanel
                instanceId="instance-1"
                threads={[]}
                canAdd
                composerFirst
                showNewComposer
                showMailCallout
            />,
        );

        const box = screen.getByLabelText("instance.messages.placeholder");
        const callout = screen.getByText("instance.messages.mail_callout");
        const save = screen.getByRole("button", {name: "save"});
        expect(
            box.compareDocumentPosition(callout) & Node.DOCUMENT_POSITION_FOLLOWING,
        ).toBeTruthy();
        expect(
            callout.compareDocumentPosition(save) & Node.DOCUMENT_POSITION_FOLLOWING,
        ).toBeTruthy();
    });

    it("uses buttons for reply and close", () => {
        render(<MessageThreadPanel instanceId="instance-1" threads={[thread]} canAdd />);

        expect(screen.getByRole("button", {name: "instance.messages.reply"})).toBeTruthy();
        expect(screen.getByRole("button", {name: "instance.messages.close"})).toBeTruthy();
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
});
