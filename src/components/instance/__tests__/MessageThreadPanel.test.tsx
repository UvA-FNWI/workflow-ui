import type {ReactNode} from "react";

import {I18nextProvider} from "react-i18next";

import {act, cleanup, fireEvent, render as renderComponent, screen} from "@testing-library/react";
import {createInstance} from "i18next";
import {afterEach, beforeAll, describe, expect, it, vi} from "vitest";

import enWorkflow from "../../../../public/locales/en/workflow.json";
import {defaultMessageUi} from "../instanceMessageSettings";
import {MessageThreadPanel} from "../MessageThreadPanel";
import type {MessageThread} from "~/store/api/types/messages";
import {formatDate} from "~/utils/formatDate";

const {addMessage, mutationState} = vi.hoisted(() => ({
    addMessage: vi.fn(),
    mutationState: {isLoading: false},
}));

vi.mock("~/store/api/messagesApi", () => ({
    messagesEndpoints: {
        addMessage: {
            useMutation: () => [addMessage, mutationState],
        },
    },
}));

const i18n = createInstance();
beforeAll(async () => {
    await i18n.init({lng: "en", resources: {en: {workflow: enWorkflow}}});
});
afterEach(() => {
    cleanup();
    addMessage.mockReset();
    mutationState.isLoading = false;
});

const render = (ui: ReactNode) =>
    renderComponent(ui, {
        wrapper: ({children}) => <I18nextProvider i18n={i18n}>{children}</I18nextProvider>,
    });

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

const replyAction = {name: "Reply"};

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

        expect(screen.getByLabelText("Add comment")).toBeTruthy();
        expect(screen.queryByRole("button", {name: enWorkflow.save})).toBeNull();
    });

    it("shows a compact new-conversation field when there are no threads", () => {
        render(<MessageThreadPanel instanceId="instance-1" threads={[]} canAdd />);

        expect(screen.getByLabelText("Add comment")).toBeTruthy();
        expect(screen.queryByRole("button", {name: enWorkflow.save})).toBeNull();
        fireEvent.focus(screen.getByLabelText("Add comment"));
        expect(screen.getByRole("button", {name: enWorkflow.save})).toBeTruthy();
    });

    it("does not show save on the new conversation until it is expanded", () => {
        render(<MessageThreadPanel instanceId="instance-1" threads={[thread]} canAdd />);

        expect(screen.queryByRole("button", {name: enWorkflow.save})).toBeNull();
        fireEvent.focus(screen.getByLabelText("Add comment"));
        expect(screen.getByRole("button", {name: enWorkflow.save})).toBeTruthy();
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
        expect(screen.queryByRole("textbox", {name: "Reply to comment"})).toBeNull();
        fireEvent.click(rootReply!);

        const input = screen.getByRole("textbox", {name: "Reply to comment"});
        const save = screen.getByRole("button", {name: enWorkflow.save});
        const cancel = screen.getByRole("button", {name: enWorkflow.cancel});
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
        expect(screen.queryByRole("textbox", {name: "Reply to comment"})).toBeNull();
        expect(screen.getAllByRole("button", replyAction)).toHaveLength(2);
    });

    it("keeps the reply text when another reply is opened", () => {
        render(<MessageThreadPanel instanceId="instance-1" threads={[thread]} canAdd />);

        const replyField = () => screen.getByRole("textbox", {name: "Reply to comment"});
        fireEvent.click(screen.getAllByRole("button", replyAction)[0]!);
        fireEvent.change(replyField(), {target: {value: "Keep this"}});
        fireEvent.click(screen.getByRole("button", replyAction));

        expect(replyField()).toHaveValue("");

        fireEvent.click(screen.getByRole("button", replyAction));
        expect(replyField()).toHaveValue("Keep this");
    });

    it("keeps the new and reply drafts when closing and reopening a conversation", async () => {
        const closed = {...thread, isClosed: true};
        const panel = (current: MessageThread) => (
            <MessageThreadPanel instanceId="instance-1" threads={[current]} canAdd />
        );
        addMessage.mockResolvedValueOnce({data: closed}).mockResolvedValueOnce({data: thread});
        const {rerender} = render(panel(thread));
        const newDraft = screen.getByRole("textbox", {name: "Add comment"});
        fireEvent.focus(newDraft);
        fireEvent.change(newDraft, {target: {value: "New draft"}});
        fireEvent.click(screen.getAllByRole("button", replyAction)[0]!);
        fireEvent.change(screen.getByRole("textbox", {name: "Reply to comment"}), {
            target: {value: "Reply draft"},
        });

        const {close_conversation, expand_conversation, reopen_conversation} =
            enWorkflow.instance.messages;
        await act(async () => {
            fireEvent.click(screen.getByRole("button", {name: close_conversation}));
        });
        rerender(panel(closed));
        fireEvent.click(screen.getByRole("button", {name: expand_conversation}));
        await act(async () => {
            fireEvent.click(screen.getByRole("button", {name: reopen_conversation}));
        });
        rerender(panel(thread));

        expect(addMessage).toHaveBeenNthCalledWith(1, {
            instanceId: "instance-1",
            replyToId: thread.id,
            kind: "Close",
        });
        expect(addMessage).toHaveBeenNthCalledWith(2, {
            instanceId: "instance-1",
            replyToId: thread.id,
            kind: "Reopen",
        });
        expect(screen.getByRole("textbox", {name: "Add comment"})).toHaveValue("New draft");
        const replyInput = {name: "Reply to comment"};
        if (!screen.queryByRole("textbox", replyInput)) {
            fireEvent.click(screen.getAllByRole("button", replyAction)[0]!);
        }
        expect(screen.getByRole("textbox", replyInput)).toHaveValue("Reply draft");
    });

    it("clears the submitted reply draft and leaves the new draft after a save", async () => {
        addMessage.mockResolvedValueOnce({data: thread});
        render(<MessageThreadPanel instanceId="instance-1" threads={[thread]} canAdd />);

        const newDraft = screen.getByRole("textbox", {name: "Add comment"});
        fireEvent.focus(newDraft);
        fireEvent.change(newDraft, {target: {value: "New draft"}});
        fireEvent.click(screen.getAllByRole("button", replyAction)[0]!);
        const replyInput = {name: "Reply to comment"};
        fireEvent.change(screen.getByRole("textbox", replyInput), {
            target: {value: "  Saved reply  "},
        });
        await act(async () => {
            fireEvent.click(screen.getByRole("button", {name: enWorkflow.save}));
        });

        expect(addMessage).toHaveBeenCalledWith(
            expect.objectContaining({
                replyToId: thread.id,
                parentItemId: "item-root",
                kind: "Message",
                body: "Saved reply",
            }),
        );
        expect(screen.queryByRole("textbox", replyInput)).not.toBeInTheDocument();
        expect(screen.getByRole("textbox", {name: "Add comment"})).toHaveValue("New draft");
        fireEvent.click(screen.getAllByRole("button", replyAction)[0]!);
        expect(screen.getByRole("textbox", replyInput)).toHaveValue("");
    });

    it("makes the pending composer read-only and keeps its draft on failure", async () => {
        const request = Promise.withResolvers<{error: {status: number}}>();
        addMessage.mockReturnValueOnce(request.promise);
        const panel = () => <MessageThreadPanel instanceId="instance-1" threads={[]} canAdd />;
        const {rerender} = render(panel());
        const draft = screen.getByRole("textbox", {name: "Add comment"});
        fireEvent.focus(draft);
        fireEvent.change(draft, {target: {value: "Retry this"}});
        const save = screen.getByRole("button", {name: enWorkflow.save});
        fireEvent.click(save);

        mutationState.isLoading = true;
        rerender(panel());
        expect(draft).toHaveAttribute("readonly");
        expect(save).toBeDisabled();

        mutationState.isLoading = false;
        await act(async () => request.resolve({error: {status: 500}}));
        rerender(panel());

        expect(draft).toHaveValue("Retry this");
        expect(draft).not.toHaveAttribute("readonly");
        expect(save).toBeEnabled();
        expect(screen.getByRole("alert")).toHaveTextContent("Failed to save. Please try again.");
    });

    it("shows inline reply starters and a close conversation button", () => {
        render(<MessageThreadPanel instanceId="instance-1" threads={[thread]} canAdd />);

        expect(screen.getAllByRole("button", replyAction)).toHaveLength(2);
        expect(
            screen.getByRole("button", {name: enWorkflow.instance.messages.close_conversation}),
        ).toBeTruthy();
    });

    it("can dismiss the new conversation field with cancel", () => {
        render(<MessageThreadPanel instanceId="instance-1" threads={[thread]} canAdd />);

        fireEvent.focus(screen.getByLabelText("Add comment"));
        expect(screen.getByRole("button", {name: enWorkflow.save})).toBeTruthy();
        fireEvent.click(screen.getByRole("button", {name: enWorkflow.cancel}));
        expect(screen.queryByRole("button", {name: enWorkflow.save})).toBeNull();
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
        expect(screen.getByText(enWorkflow.instance.messages.closed)).toBeTruthy();
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
            screen.queryByRole("button", {name: enWorkflow.instance.messages.reopen_conversation}),
        ).toBeNull();

        fireEvent.click(
            screen.getByRole("button", {name: enWorkflow.instance.messages.expand_conversation}),
        );
        expect(
            screen.getByRole("button", {name: enWorkflow.instance.messages.reopen_conversation}),
        ).toBeTruthy();
    });
});
