import {I18nextProvider} from "react-i18next";

import {cleanup, fireEvent, render, screen, waitFor} from "@testing-library/react";
import {createInstance} from "i18next";
import {afterEach, describe, expect, it, vi} from "vitest";

import enWorkflow from "../../../../public/locales/en/workflow.json";
import nlWorkflow from "../../../../public/locales/nl/workflow.json";
import {CommentsCard} from "../CommentsCard";
import type {WorkflowInstance} from "~/store/api/types/instances";
import type {MessageThread} from "~/store/api/types/messages";

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

const instance = {
    id: "instance-1",
    permissions: ["AddMessages", "ViewMessages"],
    workflowDefinition: {messagesEnabled: true},
} as WorkflowInstance;

const note: MessageThread = {
    id: "t1",
    questionName: null,
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
        {
            id: "reply-1",
            parentItemId: "comment-1",
            dateTime: "2026-09-17T11:00:00Z",
            user: {id: "user-2", displayName: "Grace Hopper"},
            kind: "Message",
            body: "A reply",
        },
    ],
};

async function renderCard(workflowInstance: WorkflowInstance, language = "en") {
    const i18n = createInstance();
    await i18n.init({
        lng: language,
        resources: {en: {workflow: enWorkflow}, nl: {workflow: nlWorkflow}},
    });
    return render(
        <I18nextProvider i18n={i18n}>
            <CommentsCard instance={workflowInstance} />
        </I18nextProvider>,
    );
}

describe("CommentsCard", () => {
    it("keeps the plain heading and open count pill when conversations can close", async () => {
        getMessages.mockReturnValue({data: [note], isSuccess: true});

        await renderCard(instance);

        expect(screen.getByRole("heading", {name: "Comments - involved staff only"})).toBeVisible();
        expect(screen.getByText("1 open")).toBeVisible();
        expect(screen.getByRole("button", {name: enWorkflow.instance.messages.add})).toBeVisible();
    });

    it.each([
        ["en", "flat", 0, "Comments - involved staff only"],
        ["en", "flat", 1, "1 Comment - involved staff only"],
        ["en", "flat", 5, "5 Comments - involved staff only"],
        ["nl", "flat", 0, "Notities - alleen voor betrokken medewerkers"],
        ["nl", "flat", 1, "1 Notitie - alleen voor betrokken medewerkers"],
        ["nl", "flat", 5, "5 Notities - alleen voor betrokken medewerkers"],
        ["en", "threaded", 5, "5 Comments - involved staff only"],
    ] as const)("shows the %s %s title for %i notes", async (language, layout, count, title) => {
        const notes = Array.from({length: count}, (_, index) =>
            index === 0
                ? note
                : {id: `note-${index}`, questionName: null, isClosed: true, items: []},
        );
        getMessages.mockReturnValue({
            data: [...notes, {id: "field-note", questionName: "Title", items: []}],
            isSuccess: true,
        });

        await renderCard(
            {
                ...instance,
                workflowDefinition: {
                    ...instance.workflowDefinition,
                    messages: {layout, allowClose: false},
                },
            },
            language,
        );

        expect(screen.getByRole("heading", {name: title})).toBeVisible();
        expect(screen.queryByText(/^\d+(?: open| closed| gesloten)?$/)).toBeNull();
    });

    it("shows the callout and focuses the new comment only after clicking add", async () => {
        getMessages.mockReturnValue({data: [note], isSuccess: true});
        await renderCard({
            ...instance,
            workflowDefinition: {
                ...instance.workflowDefinition,
                messages: {layout: "flat", allowClose: false, callout: true},
            },
        });

        const messages = enWorkflow.instance.messages;
        const disclosure = screen.getByRole("button", {name: /^1 Comment - involved staff only/});
        fireEvent.click(disclosure);
        expect(screen.getByText("An existing comment")).toBeVisible();
        expect(
            screen.queryByRole("textbox", {name: messages.new_conversation_placeholder}),
        ).toBeNull();
        expect(screen.queryByText(messages.callout_body)).toBeNull();

        fireEvent.click(disclosure);
        fireEvent.click(screen.getByRole("button", {name: messages.add}));
        const input = screen.getByRole("textbox", {name: messages.new_conversation_placeholder});
        const callout = screen.getByText(messages.callout_body);
        expect(callout).toBeVisible();
        expect(input).toAppearBefore(callout);
        expect(callout).toAppearBefore(screen.getByRole("button", {name: enWorkflow.save}));
        await waitFor(() => expect(input).toHaveFocus());

        fireEvent.click(screen.getByRole("button", {name: enWorkflow.cancel}));
        expect(
            screen.queryByRole("textbox", {name: messages.new_conversation_placeholder}),
        ).toBeNull();
        expect(screen.queryByText(messages.callout_body)).toBeNull();
        expect(screen.getByText("An existing comment")).toBeVisible();
    });
});
