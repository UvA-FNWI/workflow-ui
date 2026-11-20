import {I18nextProvider} from "react-i18next";

import {cleanup, fireEvent, render, screen, waitFor} from "@testing-library/react";
import {createInstance} from "i18next";
import {afterEach, describe, expect, it, vi} from "vitest";

import enWorkflow from "../../../../public/locales/en/workflow.json";
import nlWorkflow from "../../../../public/locales/nl/workflow.json";
import {CommentsCard} from "../CommentsCard";
import type {MessagesInfoCard, WorkflowInstance} from "~/store/api/types/instances";
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

const messagesCard: MessagesInfoCard = {name: "Messages", type: "Messages", title: null};

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

async function renderCard(
    workflowInstance: WorkflowInstance,
    language = "en",
    card = messagesCard,
) {
    const i18n = createInstance();
    await i18n.init({
        lng: language,
        resources: {en: {workflow: enWorkflow}, nl: {workflow: nlWorkflow}},
    });
    return render(
        <I18nextProvider i18n={i18n}>
            <CommentsCard instance={workflowInstance} card={card} />
        </I18nextProvider>,
    );
}

describe("CommentsCard", () => {
    it.each([
        ["en", false, "Comments", "Add comment", "1 open"],
        ["nl", true, "Notities", "Notitie toevoegen", "1 gesloten"],
    ] as const)(
        "uses the default %s heading and status pill without a configured title",
        async (language, isClosed, heading, add, summary) => {
            getMessages.mockReturnValue({data: [{...note, isClosed}], isSuccess: true});

            await renderCard(instance, language);

            expect(screen.getByRole("heading", {name: heading})).toBeVisible();
            expect(screen.getByText(summary)).toBeVisible();
            expect(screen.getByRole("button", {name: add})).toBeVisible();
        },
    );

    it.each([
        ["en", "Review notes for staff", "Add review note"],
        ["nl", "Beoordelingsnotities voor medewerkers", "Beoordelingsnotitie toevoegen"],
    ])("uses the configured %s title and workflow terms", async (language, heading, add) => {
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
                        term: {en: "review note", nl: "beoordelingsnotitie"},
                        termPlural: {en: "review notes", nl: "beoordelingsnotities"},
                    },
                },
            },
            language,
            {
                ...messagesCard,
                title: {
                    en: "Review notes for staff",
                    nl: "Beoordelingsnotities voor medewerkers",
                },
            },
        );

        expect(screen.getByRole("heading", {name: heading})).toBeVisible();
        expect(screen.getByRole("button", {name: add})).toBeVisible();
        expect(screen.getByText("1 open")).toBeVisible();
    });

    it("uses the configured terms and shows the composer and callout only after clicking add", async () => {
        const callout = {
            variant: "Warning",
            title: {en: "Student privacy", nl: "Privacy van de student"},
            text: {en: "Avoid identifying details.", nl: "Vermijd herkenbare details."},
        } as const;
        getMessages.mockReturnValue({
            data: [note, {...note, id: "field-note", questionName: "Title"}],
            isSuccess: true,
        });
        await renderCard({
            ...instance,
            workflowDefinition: {
                ...instance.workflowDefinition,
                messages: {
                    layout: "flat",
                    allowClose: false,
                    callout,
                    term: {en: "  review note  ", nl: "beoordelingsnotitie"},
                    termPlural: {en: "  review notes  ", nl: "beoordelingsnotities"},
                },
            },
        });

        const heading = "Review notes";
        const composer = {name: "Add review note"};
        const disclosure = screen.getByRole("button", {
            name: (name) => name.startsWith(heading),
        });
        expect(screen.getByRole("heading", {name: heading})).toBeVisible();
        expect(screen.getByText("1")).toBeVisible();
        fireEvent.click(disclosure);
        expect(screen.getByText("An existing comment")).toBeVisible();
        expect(screen.queryByRole("textbox", composer)).toBeNull();
        expect(screen.queryByText(callout.text.en)).toBeNull();

        fireEvent.click(disclosure);
        const add = screen.getByRole("button", composer);
        expect(add).toHaveAttribute("aria-expanded", "false");
        fireEvent.click(add);
        expect(add).toHaveAttribute("aria-expanded", "true");
        const input = screen.getByRole("textbox", composer);
        expect(input).toHaveAttribute("placeholder", composer.name);
        const calloutText = screen.getByText(callout.text.en);
        expect(calloutText).toBeVisible();
        expect(screen.getByText(callout.title.en)).toBeVisible();
        expect(input).toAppearBefore(calloutText);
        expect(calloutText).toAppearBefore(screen.getByRole("button", {name: enWorkflow.save}));
        await waitFor(() => expect(input).toHaveFocus());

        fireEvent.click(screen.getByRole("button", {name: enWorkflow.cancel}));
        expect(screen.queryByRole("textbox", composer)).toBeNull();
        expect(screen.queryByText(callout.text.en)).toBeNull();
        expect(screen.getByText("An existing comment")).toBeVisible();
    });
});
