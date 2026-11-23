import type {ReactNode} from "react";

import {I18nextProvider} from "react-i18next";

import {
    cleanup,
    fireEvent,
    render as renderComponent,
    screen,
    waitFor,
    within,
} from "@testing-library/react";
import {createInstance} from "i18next";
import {afterEach, beforeAll, describe, expect, it, vi} from "vitest";

import enWorkflow from "../../../../public/locales/en/workflow.json";
import {FieldMessageBalloon} from "../FieldMessageBalloon";
import {defaultMessageUi} from "../instanceMessageSettings";
import {QuestionAnswerList} from "../QuestionAnswerList";
import {AssessmentQuestionAnswerList} from "~/components/AssessmentOverview/AssessmentQuestionAnswerList";
import type {QuestionAnswerPair} from "~/utils/submissionUtils";

const {getMessages} = vi.hoisted(() => ({
    getMessages: vi.fn(),
}));

vi.mock("~/components/instance/AnswerCell.tsx", () => ({AnswerCell: () => null}));

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

const i18n = createInstance();
beforeAll(async () => {
    await i18n.init({lng: "en", resources: {en: {workflow: enWorkflow}}});
});
afterEach(cleanup);

const render = (ui: ReactNode) =>
    renderComponent(<I18nextProvider i18n={i18n}>{ui}</I18nextProvider>);

describe("FieldMessageBalloon", () => {
    it.each(["form", "assessment"])("uses the field message target in the %s summary", (view) => {
        const pair: QuestionAnswerPair = {
            question: {
                type: "String",
                name: "Consent",
                text: {en: "Consent", nl: "Toestemming"},
                isRequired: false,
                isArray: false,
                hideInResults: false,
                messages: {
                    instanceId: "assessment-owner",
                    questionName: "AssessmentSupervisor.Consent",
                    canView: true,
                    canAdd: false,
                },
            },
            answer: null,
            percentage: null,
        };
        getMessages.mockReturnValue({
            data: [
                {
                    id: "correct-thread",
                    questionName: "AssessmentSupervisor.Consent",
                    isClosed: false,
                    items: [
                        {
                            id: "comment-1",
                            parentItemId: null,
                            dateTime: "2026-09-17T10:00:00Z",
                            user: {id: "user-1", displayName: "Ada Lovelace"},
                            kind: "Message",
                            body: "An assessment comment",
                        },
                    ],
                },
            ],
            isSuccess: true,
        });
        render(
            view === "form" ? (
                <QuestionAnswerList instanceId="project" questionAnswerPairs={[pair]} />
            ) : (
                <AssessmentQuestionAnswerList
                    instanceId="project"
                    rows={[pair]}
                    questionAnswerPairs={[[pair]]}
                />
            ),
        );

        expect(getMessages).toHaveBeenLastCalledWith("assessment-owner", {skip: false});
        fireEvent.click(screen.getByRole("button", {name: "Comments on this field"}));
        const dialog = within(screen.getByRole("dialog"));
        expect(dialog.getByText("An assessment comment")).toBeVisible();
        expect(dialog.queryByRole("textbox")).not.toBeInTheDocument();
    });

    it("skips loading and renders nothing without view permission", () => {
        getMessages.mockReturnValue({data: [], isSuccess: true});
        const {container} = render(
            <FieldMessageBalloon
                instanceId="instance-1"
                questionName="Title"
                fieldLabel="Working title"
                canAdd
                canView={false}
            />,
        );
        expect(container).toBeEmptyDOMElement();
        expect(getMessages).toHaveBeenLastCalledWith("instance-1", {skip: true});
    });

    it.each([
        {notes: "no notes", isClosed: null, icon: "bubble-message-line"},
        {notes: "an open note", isClosed: false, icon: "bubble-message-solid"},
        {notes: "a closed note", isClosed: true, icon: "bubble-message-solid"},
    ])("shows the $icon icon and no count with $notes", async ({isClosed, icon}) => {
        getMessages.mockReturnValue({
            data:
                isClosed === null
                    ? []
                    : [{id: "thread-1", questionName: "Title", isClosed, items: []}],
            isSuccess: true,
        });
        const {container} = render(
            <FieldMessageBalloon
                instanceId="instance-1"
                questionName="Title"
                fieldLabel="Working title"
                canAdd
                canView
            />,
        );

        const trigger = screen.getByRole("button", {name: "Comments on this field"});
        const svg = trigger.querySelector("svg");
        expect(svg).toHaveAttribute("aria-hidden", "true");
        if (isClosed === null) {
            expect(svg).toHaveClass("ui:text-current");
        } else {
            expect(svg).toHaveClass("ui:text-red-600", "ui:dark:text-red-400");
        }
        expect(container).not.toHaveTextContent(/\d/);
        await waitFor(() =>
            expect(trigger.querySelector("use")).toHaveAttribute("href", `#${icon}`),
        );
        expect(document.getElementById(icon)).toBeInTheDocument();
    });

    it("opens the expanded composer with its configured callout and closes on cancel", () => {
        getMessages.mockReturnValue({data: [], isSuccess: true});
        render(
            <FieldMessageBalloon
                instanceId="instance-1"
                questionName="Title"
                fieldLabel="Working title"
                canAdd
                canView
                messageUi={{
                    ...defaultMessageUi,
                    layout: "flat",
                    allowClose: false,
                    callout: {
                        variant: "Warning",
                        title: {en: "Student privacy", nl: "Privacy van de student"},
                        text: {
                            en: "Avoid identifying details.",
                            nl: "Vermijd herkenbare details.",
                        },
                    },
                }}
            />,
        );

        fireEvent.click(screen.getByRole("button", {name: "Comments on this field"}));
        const dialog = within(screen.getByRole("dialog"));
        const input = dialog.getByRole("textbox", {name: "Add comment"});
        const save = dialog.getByRole("button", {name: enWorkflow.save});
        const cancel = dialog.getByRole("button", {name: enWorkflow.cancel});
        const callout = dialog.getByText("Avoid identifying details.");

        expect(input).toHaveAttribute("rows", "3");
        expect(dialog.getByText("Student privacy")).toBeVisible();
        expect(input).toAppearBefore(callout);
        expect(callout).toAppearBefore(save);
        expect(cancel).toHaveClass("ui:bg-white", "ui:border-black");
        expect(save).toBeDisabled();

        fireEvent.change(input, {target: {value: "   "}});
        expect(save).toBeDisabled();
        fireEvent.change(input, {target: {value: "Check this answer"}});
        expect(save).toBeEnabled();

        fireEvent.click(cancel);
        expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    });

    it("uses configured terms in the modal and preserves the draft while replying", () => {
        getMessages.mockReturnValue({
            data: [
                {
                    id: "thread-1",
                    questionName: "Title",
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
                    ],
                },
            ],
            isSuccess: true,
        });
        render(
            <FieldMessageBalloon
                instanceId="instance-1"
                questionName="Title"
                fieldLabel="Working title"
                canAdd
                canView
                messageUi={{
                    ...defaultMessageUi,
                    term: {en: "QA note", nl: "QA-notitie"},
                    termPlural: {en: "QA notes", nl: "QA-notities"},
                }}
            />,
        );

        fireEvent.click(screen.getByRole("button", {name: "QA notes on this field"}));
        const dialog = within(screen.getByRole("dialog", {name: "QA notes on Working title"}));
        const newComment = {name: "Add QA note"};
        const input = dialog.getByRole("textbox", newComment);
        expect(input).toHaveAttribute("placeholder", newComment.name);
        fireEvent.change(input, {target: {value: "A draft"}});

        fireEvent.click(dialog.getByRole("button", {name: "Reply"}));
        const reply = dialog.getByRole("textbox", {name: "Reply to QA note"});
        expect(reply).toHaveFocus();
        expect(reply).toHaveAttribute("placeholder", "Reply to QA note");
        expect(dialog.queryByRole("textbox", newComment)).not.toBeInTheDocument();

        fireEvent.click(dialog.getByRole("button", {name: enWorkflow.cancel}));
        expect(dialog.getByRole("textbox", newComment)).toHaveValue("A draft");
    });
});
