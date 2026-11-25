import {useState} from "react";

import {Provider} from "react-redux";

import {cleanup, fireEvent, render, screen, waitFor, within} from "@testing-library/react";
import {afterEach, beforeEach, expect, it, vi} from "vitest";
import {parse} from "yaml";

import {WorkflowDraftEditor} from "../WorkflowDraftEditor";
import type {DraftLocation} from "../WorkflowDraftOverview";
import type {Form} from "~/store/api/types/submissions";
import type {WorkflowDraftWorkspace} from "~/store/api/workflowDraftsApi";
import {store} from "~/store/store";

afterEach(cleanup);

const {save, preview, discard, formChanges} = vi.hoisted(() => ({
    save: vi.fn(),
    preview: vi.fn(),
    discard: vi.fn(),
    formChanges: vi.fn(),
}));
vi.mock("~/store/api/workflowDraftsApi", async (importOriginal) => ({
    ...(await importOriginal<typeof import("~/store/api/workflowDraftsApi")>()),
    useSaveWorkflowDraftMutation: () => [save],
    useGetDraftFormChangesQuery: formChanges,
    usePreviewWorkflowDraftMutation: () => [preview],
    usePreviewWorkflowMutation: () => [vi.fn()],
    useProposeWorkflowDraftMutation: () => [vi.fn()],
    useMergeWorkflowDraftMutation: () => [vi.fn()],
    useDiscardWorkflowDraftMutation: () => [discard, {isLoading: false}],
}));
vi.mock("~/components/FormEditor/model/schema", async (importOriginal) => ({
    ...(await importOriginal<typeof import("~/components/FormEditor/model/schema")>()),
    loadSchema: async () => ({
        properties: {name: {}, type: {}, text: {}, control: {}, values: {}},
    }),
}));
vi.mock("~/hooks/useTranslate", () => ({
    useTranslate: () => ({
        t: (key: string, options?: {sha?: string}) =>
            options?.sha ? key + " " + options.sha : key,
        l: (text?: {en?: string; nl?: string} | string | null) =>
            typeof text === "string" ? text : text?.en || text?.nl,
        i18n: {language: "en"},
    }),
}));

beforeEach(() => {
    save.mockReset();
    preview.mockReset();
    discard.mockReset();
    formChanges.mockReset();
});

const baseSha = "a".repeat(40);
const head = {project: "course-a", draft: "draft", expectedHeadSha: baseSha};
const project = {id: "course-a", title: "Course A", canEdit: true, canMerge: false};
const formPath = "Projects/Example/Forms/Start.yaml";
const fieldsPath = "Projects/Example/Entity.yaml";
const draftProps = {
    location: {form: formPath},
    onNavigate: vi.fn(),
    reload: vi.fn(),
    onDiscarded: vi.fn(),
};
const originalForm = `pages:
  - name: Introduction
    title: Introduction
    elements:
      - text: Old help
      - question: Feedback
  - name: Details
    elements: []
`;
const original: WorkflowDraftWorkspace = {
    draft: {
        id: "draft",
        baseSha,
        baseCommitUrl: "https://github.com/example/config/commit/" + baseSha,
        headSha: baseSha,
        pullRequest: null,
        hasBranch: true,
    },
    steps: [
        {
            name: "Start",
            title: {en: "Start", nl: "Start"},
            actions: [],
            completion: null,
            children: [
                {
                    name: "Review",
                    title: {en: "Review", nl: "Beoordeling"},
                    children: [],
                    actions: [
                        {
                            type: "Submit",
                            label: {en: "Submit review", nl: "Dien beoordeling in"},
                            roles: [{en: "Coordinator", nl: "Coördinator"}],
                            forms: [
                                {name: "Start", title: {en: "Start form", nl: "Startformulier"}},
                            ],
                            allForms: false,
                            conditional: false,
                        },
                    ],
                    completion: {
                        kind: "event",
                        negated: false,
                        label: {en: "Reviewed", nl: "Beoordeeld"},
                        children: [],
                        operator: null,
                        operand: null,
                    },
                },
            ],
        },
    ],
    forms: [
        {
            path: formPath,
            name: "Start",
            title: {en: "Start form", nl: "Startformulier"},
            layout: "Normal",
            steps: [
                {name: "Start", actionLabels: []},
                {name: "Review", actionLabels: []},
            ],
        },
    ],
    files: {
        [formPath]: originalForm,
        [fieldsPath]:
            "name: Example\nproperties:\n  - name: Feedback\n    type: String\n    text: Feedback\n",
    },
    editablePaths: [formPath, fieldsPath],
};
const saved: WorkflowDraftWorkspace = {
    ...original,
    draft: {...original.draft, headSha: "b".repeat(40)},
    files: {...original.files, [formPath]: originalForm.replace("Old help", "Saved help")},
};
const previewForm: Form = {
    name: "Start",
    title: {en: "Start form", nl: "Startformulier"},
    layout: "Normal",
    pages: [
        {
            name: "Introduction",
            index: 0,
            layout: "Normal",
            isActive: true,
            isInCurrentForm: true,
            hasResults: false,
            title: {en: "Introduction", nl: "Introductie"},
            elements: [
                {kind: "Text", text: {en: "Saved help", nl: "Saved help"}},
                {
                    kind: "Question",
                    question: {
                        name: "Feedback",
                        text: {en: "Feedback", nl: "Feedback"},
                        type: "String",
                        isRequired: true,
                        isArray: false,
                        hideInResults: false,
                    },
                },
            ],
        },
        {
            name: "Details",
            index: 1,
            layout: "Normal",
            isActive: true,
            isInCurrentForm: true,
            hasResults: false,
            title: {en: "Details", nl: "Details"},
            elements: [],
        },
    ],
};

it("opens a form from a workflow step and returns to that step with pending edits", async () => {
    function DraftNavigation({initial}: {initial: WorkflowDraftWorkspace}) {
        const [location, setLocation] = useState<DraftLocation>({});
        return (
            <WorkflowDraftEditor
                project={project}
                initial={initial}
                {...draftProps}
                location={location}
                onNavigate={setLocation}
            />
        );
    }
    const {rerender} = render(<DraftNavigation initial={original} />);
    expect(screen.getByRole("button", {name: "authoring_preview_workflow"})).toBeInTheDocument();
    expect(screen.getByRole("heading", {name: "Start"})).toBeInTheDocument();
    expect(screen.queryByRole("button", {name: "authoring_workflow_forms"})).toBeNull();
    fireEvent.click(within(screen.getByRole("navigation")).getByRole("button", {name: "Review"}));
    expect(screen.getByText("Submit review")).toBeInTheDocument();
    expect(screen.getByText("authoring_rule.event")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", {name: /Start form/}));
    expect(screen.getByRole("button", {name: "authoring_preview"})).toBeInTheDocument();
    const text = screen.getByRole("textbox", {name: "text_block"});
    fireEvent.change(text, {target: {value: "Pending edit"}});
    expect(await screen.findByText("authoring_unsaved_changes")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", {name: "authoring_back_to_section"}));
    expect(screen.getByRole("heading", {name: "Review"})).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", {name: "authoring_screens"}));
    expect(screen.getByText("authoring_screens_placeholder")).toBeInTheDocument();
    fireEvent.click(within(screen.getByRole("navigation")).getByRole("button", {name: "Start"}));
    fireEvent.click(screen.getByRole("button", {name: /Start form/}));
    expect(screen.getByRole("textbox", {name: "text_block"})).toHaveValue("Pending edit");

    const withWorkflowForm = {
        ...original,
        forms: [
            ...original.forms,
            {
                path: "Projects/Example/Forms/Workflow.yaml",
                name: "Workflow",
                title: {en: "Workflow form", nl: "Workflowformulier"},
                layout: "Normal" as const,
                steps: [],
            },
        ],
    };
    rerender(<DraftNavigation key="with-workflow-form" initial={withWorkflowForm} />);
    fireEvent.click(screen.getByRole("button", {name: "authoring_workflow_forms"}));
    expect(screen.getByRole("button", {name: "Workflow form"})).toBeInTheDocument();
    expect(screen.queryByRole("button", {name: /Start form/})).toBeNull();
});

it("applies draft form settings through the existing save flow", async () => {
    save.mockReturnValue({unwrap: () => Promise.resolve(saved)});
    const {rerender} = render(
        <WorkflowDraftEditor project={project} initial={original} {...draftProps} />,
    );
    fireEvent.click(screen.getByRole("button", {name: "authoring_form_settings"}));
    const dialog = within(await screen.findByRole("dialog", {name: "authoring_form_settings"}));
    rerender(<WorkflowDraftEditor project={project} initial={{...original}} {...draftProps} />);
    fireEvent.change(dialog.getByRole("textbox", {name: "language.en"}), {
        target: {value: "Updated form"},
    });
    fireEvent.click(dialog.getByRole("radio", {name: "authoring_form_layouts.Compact"}));
    fireEvent.click(dialog.getByRole("button", {name: "authoring_apply_form_settings"}));
    expect(await screen.findByRole("heading", {name: "Updated form"})).toBeInTheDocument();
    expect(screen.getAllByText("Introduction", {selector: "h2"})).toHaveLength(1);
    fireEvent.click(screen.getByRole("button", {name: "authoring_save"}));
    await waitFor(() => expect(save).toHaveBeenCalledOnce());
    expect(parse(save.mock.calls[0][0].files[formPath])).toMatchObject({
        title: {en: "Updated form", nl: "Startformulier"},
        layout: "Compact",
    });
});

it("shows the callout drag handle and expands to its editor and live preview", () => {
    const formWithCallout = originalForm.replace(
        "      - question: Feedback",
        `      - callout:
          variant: warning
          title: Submission rule
          text: "**Read first**"
      - question: Feedback`,
    );
    const initial = {...original, files: {...original.files, [formPath]: formWithCallout}};
    render(<WorkflowDraftEditor project={project} initial={initial} {...draftProps} />);

    const title = screen.getByRole("button", {name: "Submission rule"});
    expect(title).toHaveAttribute("aria-expanded", "false");
    expect(within(title.parentElement!).getByRole("button", {name: "drag_handle"})).toBeEnabled();
    expect(screen.queryByText("Read first")).toBeNull();

    fireEvent.click(title);
    expect(screen.getByRole("textbox", {name: "callout_text"})).toHaveValue("**Read first**");
    expect(screen.getByText("preview_label")).toBeInTheDocument();
    expect(screen.getByText("Read first").tagName).toBe("STRONG");
});

it("keeps the coordinator's text after a stale save", async () => {
    save.mockReturnValue({
        unwrap: () =>
            Promise.reject({
                status: 409,
                data: {error: "DraftHeadChanged", message: "The draft changed."},
            }),
    });

    render(<WorkflowDraftEditor project={project} initial={original} {...draftProps} />);
    const editor = screen.getByRole("textbox", {name: "text_block"});
    fireEvent.change(editor, {target: {value: "Unsaved edit"}});
    expect(await screen.findByText("authoring_unsaved_changes")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", {name: "authoring_save"}));

    expect(await screen.findByText("authoring_error_draft_changed")).toBeInTheDocument();
    expect(screen.getByRole("link", {name: "authoring_compare_in_new_tab"})).toHaveAttribute(
        "target",
        "_blank",
    );
    expect(editor).toHaveValue("Unsaved edit");
    expect(save).toHaveBeenCalledWith({
        ...head,
        files: {
            [formPath]: originalForm.replace("Old help", "Unsaved edit"),
        },
        yamlFiles: [],
    });
    expect(screen.queryByRole("button", {name: "authoring_merge"})).not.toBeInTheDocument();
});

it("previews pending edits without saving and reloads the committed form", async () => {
    preview.mockReturnValue({unwrap: () => Promise.resolve(previewForm)});
    save.mockReturnValue({unwrap: () => Promise.resolve(saved)});
    const {rerender} = render(
        <WorkflowDraftEditor project={project} initial={original} {...draftProps} />,
        {wrapper: ({children}) => <Provider store={store}>{children}</Provider>},
    );

    expect(screen.getByRole("navigation", {name: "pages"})).toBeInTheDocument();
    expect(screen.getByText("authoring_no_saved_changes")).toBeInTheDocument();
    fireEvent.change(screen.getByRole("textbox", {name: "text_block"}), {
        target: {value: "Saved help"},
    });
    await screen.findByText("authoring_unsaved_changes");
    fireEvent.click(screen.getByRole("button", {name: "authoring_preview"}));
    const viewer = within(await screen.findByRole("dialog", {name: "Start form"}));
    expect(viewer.getByText("Saved help")).toBeInTheDocument();
    const answer = viewer.getByRole("textbox", {name: "Feedback"});
    fireEvent.change(answer, {target: {value: "Try an answer"}});
    fireEvent.click(viewer.getByRole("tab", {name: "Details"}));
    fireEvent.click(viewer.getByRole("tab", {name: "Introduction"}));
    expect(viewer.getByRole("textbox", {name: "Feedback"})).toHaveValue("Try an answer");
    expect(preview).toHaveBeenCalledWith({
        ...head,
        formPath,
        files: {
            [formPath]: saved.files[formPath],
        },
        yamlFiles: [],
    });
    expect(save).not.toHaveBeenCalled();

    fireEvent.click(viewer.getByRole("button", {name: "common:close"}));
    expect(screen.getByRole("textbox", {name: "text_block"})).toHaveValue("Saved help");
    fireEvent.click(screen.getByRole("button", {name: "authoring_save"}));
    await waitFor(() => expect(screen.getByText("authoring_changes_saved")).toBeInTheDocument());
    expect(save).toHaveBeenCalledWith({
        ...head,
        files: {
            [formPath]: saved.files[formPath],
        },
        yamlFiles: [],
    });

    rerender(<WorkflowDraftEditor project={project} initial={saved} {...draftProps} />);
    expect(screen.getByRole("textbox", {name: "text_block"})).toHaveValue("Saved help");
    const technicalDetails = screen.getByText("authoring_technical_details");
    expect(technicalDetails.parentElement).not.toHaveAttribute("open");
    fireEvent.click(technicalDetails);
    expect(screen.getByRole("link", {name: "authoring_started_from aaaaaaaa"})).toHaveAttribute(
        "href",
        original.draft.baseCommitUrl,
    );
});

it("uses the question builder to change type, options, and required status in the draft", async () => {
    save.mockReturnValue({unwrap: () => Promise.resolve(saved)});
    render(<WorkflowDraftEditor project={project} initial={original} {...draftProps} />);

    fireEvent.click(screen.getByRole("button", {name: "change_type"}));
    fireEvent.click(await screen.findByRole("button", {name: "kind.SingleChoice"}));
    await screen.findByText("authoring_unsaved_changes");
    fireEvent.click(screen.getByRole("button", {name: /^Feedback/}));
    fireEvent.click(screen.getByRole("checkbox", {name: "required"}));
    const addChoice = screen.getByRole("button", {name: "add_choice"});
    await waitFor(() => expect(addChoice).toBeEnabled());
    fireEvent.click(addChoice);
    const saveButton = screen.getByRole("button", {name: "authoring_save"});
    await waitFor(() => expect(saveButton).toBeEnabled());
    fireEvent.click(saveButton);

    const property = parse(save.mock.calls[0][0].files[fieldsPath]).properties[0];
    expect(property).toMatchObject({
        type: "Feedback!",
        values: [{name: "Option1"}, {text: {nl: "new_choice"}}],
    });

    const after = structuredClone(previewForm);
    after.pages[0].elements[1].question!.isRequired = false;
    formChanges.mockReturnValue({currentData: [{path: formPath, before: previewForm, after}]});
    fireEvent.click(await screen.findByRole("button", {name: "authoring_review_changes"}));
    expect(await screen.findByText("authoring_change_required")).toBeInTheDocument();
    expect(screen.getByRole("button", {name: "authoring_preview_original"})).toBeEnabled();
    expect(screen.getByRole("button", {name: "authoring_preview_saved"})).toBeEnabled();
});

it("discards a proposed draft only after confirmation", async () => {
    const onDiscarded = vi.fn();
    const initial: WorkflowDraftWorkspace = {
        ...saved,
        draft: {
            ...saved.draft,
            pullRequest: {
                number: 98,
                url: "https://github.com/example/config/pull/98",
                state: "open",
                headSha: saved.draft.headSha,
                mergedSha: null,
            },
        },
    };
    discard.mockReturnValue({unwrap: () => Promise.resolve(true)});
    render(
        <WorkflowDraftEditor
            project={project}
            initial={initial}
            {...draftProps}
            onDiscarded={onDiscarded}
        />,
    );
    expect(screen.getByText("authoring_in_review")).toBeInTheDocument();
    expect(screen.queryByRole("button", {name: "authoring_save"})).not.toBeInTheDocument();

    const openConfirmation = async () => {
        fireEvent.keyDown(screen.getByRole("button", {name: "authoring_draft_actions"}), {
            key: "ArrowDown",
        });
        const menuItem = await screen.findByRole("menuitem", {name: "authoring_discard_draft"});
        fireEvent.click(menuItem);
        return await screen.findByRole("dialog");
    };
    const canceled = await openConfirmation();
    expect(within(canceled).getByText("authoring_discard_proposal")).toBeInTheDocument();
    fireEvent.click(within(canceled).getByRole("button", {name: "cancel"}));
    expect(discard).not.toHaveBeenCalled();

    const confirmed = await openConfirmation();
    fireEvent.click(within(confirmed).getByRole("button", {name: "authoring_discard_draft"}));
    await waitFor(() => expect(onDiscarded).toHaveBeenCalledOnce());
    expect(discard).toHaveBeenCalledWith({
        ...head,
        expectedHeadSha: saved.draft.headSha,
        pullRequestNumber: 98,
    });
});
