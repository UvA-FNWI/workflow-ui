import {useEffect} from "react";

import {cleanup, fireEvent, render, screen} from "@testing-library/react";
import {afterEach, beforeEach, expect, it, vi} from "vitest";

import {WorkflowActions} from "../WorkflowActions";
import type {Action} from "~/store/api/types/instances";
import type {Form} from "~/store/api/types/submissions";

const loading = vi.hoisted(() => ({value: false}));
const {loadForm, retry} = vi.hoisted(() => ({loadForm: vi.fn(), retry: vi.fn()}));
const loadedForm: Form = {
    name: "ExtensionDialog",
    title: {en: "Configured form", nl: "Ingesteld formulier"},
    layout: "Modal",
    pages: [],
};
vi.mock("~/store/api/deadlinesApi", () => ({
    deadlinesApi: {
        endpoints: {
            getPostponementForm: {useQuery: loadForm},
            postponeDeadlines: {useMutation: () => [vi.fn(), {isLoading: false}]},
        },
    },
}));
beforeEach(() => {
    loading.value = false;
    retry.mockReset();
    loadForm.mockReset().mockReturnValue({
        currentData: loadedForm,
        isFetching: false,
        isError: false,
        refetch: retry,
    });
});
vi.mock("~/hooks/useTranslate", () => ({
    useTranslate: () => ({l: (value?: {en: string}) => value?.en, t: (key: string) => key}),
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

it("loads the configured form only when the postponement modal opens", () => {
    const postponed: Action = {
        ...action,
        type: "PostponeDeadlines",
        name: "GrantExtension",
        form: "ExtensionDialog",
    };
    render(<WorkflowActions instanceId="instance" actions={[postponed]} />);
    expect(loadForm).not.toHaveBeenCalled();
    const button = screen.getByRole("button", {name: "Open form"});
    fireEvent.click(button);
    expect(loadForm).toHaveBeenCalledWith(
        {instanceId: "instance", actionName: "GrantExtension"},
        {refetchOnMountOrArgChange: true},
    );
    expect(button).not.toBeDisabled();
    expect(screen.getByRole("dialog")).toHaveTextContent("Configured form");
    fireEvent.click(screen.getByRole("button", {name: "cancel"}));
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
});

it("waits for fresh metadata on reopening and allows cancellation while loading", () => {
    loadForm.mockReturnValue({
        currentData: loadedForm,
        isFetching: true,
        isError: false,
        refetch: retry,
    });
    const postponed: Action = {...action, type: "PostponeDeadlines"};
    const {rerender} = render(<WorkflowActions instanceId="instance" actions={[postponed]} />);
    const button = screen.getByRole("button", {name: "Open form"});
    fireEvent.click(button);
    expect(button).toBeDisabled();
    expect(screen.getByRole("status", {name: "form_loading.loading"})).toBeInTheDocument();
    expect(screen.queryByText("Configured form")).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", {name: "cancel"}));
    fireEvent.click(button);
    loadForm.mockReturnValue({
        currentData: loadedForm,
        isFetching: false,
        isError: false,
        refetch: retry,
    });
    rerender(<WorkflowActions instanceId="instance" actions={[postponed]} />);
    expect(screen.getByRole("dialog")).toHaveTextContent("Configured form");
    expect(button).not.toBeDisabled();
});

it("offers retry after a load error without revealing cached metadata", () => {
    loadForm.mockReturnValue({
        currentData: loadedForm,
        isFetching: false,
        isError: true,
        refetch: retry,
    });
    render(
        <WorkflowActions
            instanceId="instance"
            actions={[{...action, type: "PostponeDeadlines"}]}
        />,
    );
    fireEvent.click(screen.getByRole("button", {name: "Open form"}));
    expect(screen.getByText("form_loading.error")).toBeInTheDocument();
    expect(screen.queryByText("Configured form")).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", {name: "form_loading.retry"}));
    expect(retry).toHaveBeenCalledOnce();
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
