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
    it.each([
        ["en", false, "1 open"],
        ["nl", true, "1 gesloten"],
    ] as const)(
        "uses the default %s heading and status pill without a configured title",
        async (language, isClosed, summary) => {
            getMessages.mockReturnValue({data: [{...note, isClosed}], isSuccess: true});

            await renderCard(instance, language);

            const messages = (language === "nl" ? nlWorkflow : enWorkflow).instance.messages;
            expect(screen.getByRole("heading", {name: messages.title})).toBeVisible();
            expect(screen.getByText(summary)).toBeVisible();
            expect(screen.getByRole("button", {name: messages.add})).toBeVisible();
        },
    );

    it.each([
        ["en", "Review notes (2)"],
        ["nl", "Beoordelingsnotities (2)"],
    ])("uses the configured %s heading with the instance note count", async (language, heading) => {
        getMessages.mockReturnValue({
            data: [
                note,
                {id: "closed-note", questionName: null, isClosed: true, items: []},
                {id: "field-note", questionName: "Title", isClosed: false, items: []},
            ],
            isSuccess: true,
        });

        await renderCard(
            {
                ...instance,
                workflowDefinition: {
                    ...instance.workflowDefinition,
                    messages: {
                        cardTitle: {
                            en: "Review notes ({{count}})",
                            nl: "Beoordelingsnotities ({{ count }})",
                        },
                    },
                },
            },
            language,
        );

        expect(screen.getByRole("heading", {name: heading})).toBeVisible();
        expect(screen.getByText("1 open")).toBeVisible();
    });

    it("shows the callout and focuses the new comment only after clicking add", async () => {
        const callout = {
            variant: "Warning",
            title: {en: "Student privacy", nl: "Privacy van de student"},
            text: {en: "Avoid identifying details.", nl: "Vermijd herkenbare details."},
        } as const;
        getMessages.mockReturnValue({data: [note], isSuccess: true});
        await renderCard({
            ...instance,
            workflowDefinition: {
                ...instance.workflowDefinition,
                messages: {layout: "flat", allowClose: false, callout},
            },
        });

        const messages = enWorkflow.instance.messages;
        const disclosure = screen.getByRole("button", {
            name: (name) => name.startsWith(messages.title),
        });
        expect(screen.getByRole("heading", {name: messages.title})).toBeVisible();
        fireEvent.click(disclosure);
        expect(screen.getByText("An existing comment")).toBeVisible();
        expect(
            screen.queryByRole("textbox", {name: messages.new_conversation_placeholder}),
        ).toBeNull();
        expect(screen.queryByText(callout.text.en)).toBeNull();

        fireEvent.click(disclosure);
        const add = screen.getByRole("button", {name: messages.add});
        expect(add).toHaveAttribute("aria-expanded", "false");
        fireEvent.click(add);
        expect(add).toHaveAttribute("aria-expanded", "true");
        const input = screen.getByRole("textbox", {name: messages.new_conversation_placeholder});
        const calloutText = screen.getByText(callout.text.en);
        expect(calloutText).toBeVisible();
        expect(screen.getByText(callout.title.en)).toBeVisible();
        expect(input).toAppearBefore(calloutText);
        expect(calloutText).toAppearBefore(screen.getByRole("button", {name: enWorkflow.save}));
        await waitFor(() => expect(input).toHaveFocus());

        fireEvent.click(screen.getByRole("button", {name: enWorkflow.cancel}));
        expect(
            screen.queryByRole("textbox", {name: messages.new_conversation_placeholder}),
        ).toBeNull();
        expect(screen.queryByText(callout.text.en)).toBeNull();
        expect(screen.getByText("An existing comment")).toBeVisible();
    });
});
