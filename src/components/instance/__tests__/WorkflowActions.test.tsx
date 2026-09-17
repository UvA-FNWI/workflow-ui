import {useEffect} from "react";

import {cleanup, fireEvent, render, screen} from "@testing-library/react";
import {afterEach, beforeEach, expect, it, vi} from "vitest";

import {WorkflowActions} from "../WorkflowActions";
import type {Action} from "~/store/api/types/instances";
import type {Form} from "~/store/api/types/submissions";

const loading = vi.hoisted(() => ({value: false}));
beforeEach(() => {
    loading.value = false;
});
vi.mock("~/hooks/useTranslate", () => ({
    useTranslate: () => ({l: (value: {en: string}) => value.en}),
}));
type ModalProps = {
    submissionId?: string;
    onClose: () => void;
    onLoadingChange: (loading: boolean) => void;
};
vi.mock("../FormModal", () => ({
    FormModal: ({submissionId, onClose, onLoadingChange}: ModalProps) => {
        const isLoading = loading.value;
        useEffect(() => onLoadingChange(isLoading), [onLoadingChange, isLoading]);
        return (
            <div role="dialog">
                {submissionId}
                <button onClick={onClose}>Cancel</button>
            </div>
        );
    },
}));
vi.mock("../deadlines/PostponeDeadlineModal", () => ({
    PostponeDeadlineModal: ({
        actionName,
        form,
        onClose,
    }: {
        actionName: string;
        form: Form;
        onClose: () => void;
    }) => (
        <div role="dialog">
            {actionName}: {form.title.en}
            <button onClick={onClose}>Cancel</button>
        </div>
    ),
}));
afterEach(cleanup);
const action: Action = {
    id: "form",
    name: "form",
    type: "SubmitForm",
    form: "ExampleForm",
    formLayout: "Modal",
    steps: [],
    intent: "Secondary",
    title: {en: "Open form", nl: "Formulier openen"},
};

it("shows only workflow-level modal actions and closes the modal on cancel", () => {
    const {rerender} = render(
        <WorkflowActions
            instanceId="instance"
            actions={[action, {...action, id: "step", steps: ["Start"]}]}
        />,
    );
    expect(screen.getAllByRole("button", {name: "Open form"})).toHaveLength(1);
    fireEvent.click(screen.getByRole("button", {name: "Open form"}));
    expect(screen.getByRole("dialog")).toHaveTextContent("ExampleForm");
    fireEvent.click(screen.getByText("Cancel"));
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", {name: "Open form"}));
    rerender(<WorkflowActions instanceId="instance" actions={[]} />);
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    expect(screen.queryByRole("button")).not.toBeInTheDocument();
});

it("shows loading reported by the form modal on the selected button", () => {
    loading.value = true;
    const {rerender} = render(<WorkflowActions instanceId="instance" actions={[action]} />);
    const button = screen.getByRole("button", {name: "Open form"});
    fireEvent.click(button);
    expect(button).toBeDisabled();
    expect(button).toContainElement(screen.getByText("Loading..."));
    loading.value = false;
    rerender(<WorkflowActions instanceId="instance" actions={[action]} />);
    expect(button).not.toBeDisabled();
});

it("selects the dedicated modal by form type and opens it without loading", () => {
    const execute: Action = {
        ...action,
        type: "Execute",
        name: "GrantExtension",
        modalForm: {
            name: "ExtensionDialog",
            title: {en: "Configured form", nl: "Ingesteld formulier"},
            type: "PostponeDeadline",
            layout: "Modal",
            pages: [],
        },
    };
    render(<WorkflowActions instanceId="instance" actions={[execute]} />);
    const button = screen.getByRole("button", {name: "Open form"});
    fireEvent.click(button);
    expect(button).not.toBeDisabled();
    expect(screen.queryByText("Loading...")).not.toBeInTheDocument();
    expect(screen.getByRole("dialog")).toHaveTextContent("GrantExtension: Configured form");
    fireEvent.click(screen.getByRole("button", {name: "Cancel"}));
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
});

it("does not render buttons for unsupported actions", () => {
    render(
        <WorkflowActions
            instanceId="instance"
            actions={[
                {...action, type: "Execute", name: "UnrelatedAction", form: undefined},
                {...action, id: "normal", formLayout: "Normal"},
            ]}
        />,
    );
    expect(screen.queryByRole("button")).not.toBeInTheDocument();
});
