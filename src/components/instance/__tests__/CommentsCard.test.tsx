import {cleanup, fireEvent, render, screen} from "@testing-library/react";
import {afterEach, describe, expect, it, vi} from "vitest";

import {CommentsCard} from "../CommentsCard";
import type {WorkflowInstance} from "~/store/api/types/instances";

const {getMessages} = vi.hoisted(() => ({
    getMessages: vi.fn(),
}));

vi.mock("~/hooks/useTranslate", () => ({
    useTranslate: () => ({
        t: (key: string, values?: {title?: string; audience?: string; count?: number}) =>
            key === "instance.messages.heading"
                ? `${values?.title} - ${values?.audience}`
                : key === "instance.messages.summary_open"
                  ? `${values?.count} open`
                  : key,
    }),
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

vi.mock("../MessageThreadPanel", () => ({
    MessageThreadPanel: ({focusNewConversation}: {focusNewConversation?: boolean}) => (
        <div data-testid="message-thread">{focusNewConversation ? "focused" : "default"}</div>
    ),
}));

afterEach(cleanup);

const instance = {
    id: "instance-1",
    permissions: ["AddInstanceMessage"],
    workflowDefinition: {messagesEnabled: true},
} as WorkflowInstance;

describe("CommentsCard", () => {
    it("titles the card and shows open conversations in a pill", () => {
        getMessages.mockReturnValue({
            data: [
                {
                    id: "t1",
                    questionName: null,
                    isClosed: false,
                    items: [],
                },
            ],
            isSuccess: true,
        });

        render(<CommentsCard instance={instance} />);

        expect(
            screen.getByRole("heading", {
                name: /instance\.messages\.title/,
            }),
        ).toBeTruthy();
        expect(screen.getByText("1 open")).toBeTruthy();
        expect(screen.getByLabelText("instance.messages.add")).toBeTruthy();
    });

    it("focuses the new conversation field from the add control", () => {
        getMessages.mockReturnValue({
            data: [
                {
                    id: "t1",
                    questionName: null,
                    isClosed: false,
                    items: [],
                },
            ],
            isSuccess: true,
        });

        render(<CommentsCard instance={instance} />);

        fireEvent.click(screen.getByLabelText("instance.messages.add"));
        expect(screen.getByTestId("message-thread")).toHaveTextContent("focused");
    });
});
