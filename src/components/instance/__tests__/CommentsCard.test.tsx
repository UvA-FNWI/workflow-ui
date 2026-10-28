import {cleanup, fireEvent, render, screen} from "@testing-library/react";
import {afterEach, describe, expect, it, vi} from "vitest";

import {CommentsCard} from "../CommentsCard";
import type {WorkflowInstance} from "~/store/api/types/instances";

const {getMessages} = vi.hoisted(() => ({
    getMessages: vi.fn(),
}));

vi.mock("~/hooks/useTranslate", () => ({
    useTranslate: () => ({
        t: (key: string, values?: {title?: string; audience?: string}) =>
            key === "instance.messages.heading" ? `${values?.title} - ${values?.audience}` : key,
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
    MessageThreadPanel: ({showNewComposer}: {showNewComposer?: boolean}) => (
        <div data-testid="message-thread">{showNewComposer ? "composer" : "notes"}</div>
    ),
}));

afterEach(cleanup);

const instance = {
    id: "instance-1",
    permissions: ["AddInstanceMessage"],
    workflowDefinition: {messagesEnabled: true},
} as WorkflowInstance;

describe("CommentsCard", () => {
    it("titles the card without a count and keeps add for opening the composer", () => {
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
        expect(screen.queryByLabelText("instance.messages.info")).toBeNull();
        expect(screen.getByLabelText("instance.messages.add")).toBeTruthy();
        expect(screen.getByTestId("message-thread")).toHaveTextContent("notes");
    });

    it("toggles the type box from the add control", () => {
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
        const add = screen.getByLabelText("instance.messages.add");

        fireEvent.click(add);
        expect(screen.getByTestId("message-thread")).toHaveTextContent("composer");
        expect(add).toHaveAttribute("aria-pressed", "true");

        fireEvent.click(add);
        expect(screen.getByTestId("message-thread")).toHaveTextContent("notes");
        expect(add).toHaveAttribute("aria-pressed", "false");
    });
});
