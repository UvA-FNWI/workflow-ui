import {cleanup, render, screen} from "@testing-library/react";
import {afterEach, describe, expect, it, vi} from "vitest";

import {FieldMessageBalloon} from "../FieldMessageBalloon";

vi.mock("~/hooks/useTranslate", () => ({
    useTranslate: () => ({
        t: (key: string) => key,
    }),
}));

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

describe("FieldMessageBalloon", () => {
    it("renders nothing when allowMessages is false", () => {
        getMessages.mockReturnValue({data: [], isSuccess: true});
        const {container} = render(
            <FieldMessageBalloon
                instanceId="instance-1"
                questionName="Title"
                fieldLabel="Working title"
                allowMessages={false}
                canAdd
            />,
        );
        expect(container).toBeEmptyDOMElement();
    });

    it("shows trigger when user can add on an eligible field", () => {
        getMessages.mockReturnValue({data: [], isSuccess: true});
        render(
            <FieldMessageBalloon
                instanceId="instance-1"
                questionName="Title"
                fieldLabel="Working title"
                allowMessages
                canAdd
            />,
        );
        expect(screen.getByLabelText("instance.messages.field_label")).toBeTruthy();
    });
});
