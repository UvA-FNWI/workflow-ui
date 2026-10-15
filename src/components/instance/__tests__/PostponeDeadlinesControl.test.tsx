import {cleanup, fireEvent, render, screen, waitFor} from "@testing-library/react";
import {format, parseISO} from "date-fns";
import {createInstance} from "i18next";
import {afterEach, beforeEach, describe, expect, it, vi} from "vitest";

import en from "../../../../public/locales/en/workflow.json";
import nl from "../../../../public/locales/nl/workflow.json";
import {PostponeDeadlinesControl} from "../PostponeDeadlinesControl";

const translations = createInstance();
await translations.init({
    lng: "en",
    defaultNS: "workflow",
    resources: {en: {workflow: en}, nl: {workflow: nl}},
    interpolation: {escapeValue: false},
});

const {postpone, dispatch, toast, deadlines} = vi.hoisted(() => ({
    postpone: vi.fn(),
    dispatch: vi.fn(),
    toast: {success: vi.fn(), warning: vi.fn(), error: vi.fn()},
    deadlines: [
        {property: "DueDate", title: {en: "Submission", nl: "Inleveren"}, date: "2026-10-01"},
        {
            property: "OtherDate",
            title: {en: "Assessment", nl: "Beoordeling"},
            date: "2026-10-02",
        },
    ],
}));

vi.mock("~/hooks/useTranslate", () => ({
    useTranslate: () => ({
        t: (key: string, options?: Record<string, string>) =>
            key === "postpone.description" ||
            key.startsWith("postpone.reasons.") ||
            key.startsWith("postpone.examination_board_")
                ? translations.t(key, options)
                : key,
        l: (value: {en: string; nl: string}) => value[translations.language as "en" | "nl"],
        i18n: translations,
    }),
}));
vi.mock("~/store/api/instancesApi", () => ({
    instancesEndpoints: {
        postponeDeadlines: {useMutation: () => [postpone, {isLoading: false}]},
    },
    instancesApi: {
        util: {invalidateTags: (tags: unknown) => ({type: "invalidate", payload: tags})},
    },
}));
vi.mock("~/store/store", () => ({useAppDispatch: () => dispatch}));
vi.mock("@uva-fnwi/datanose-ui", async () => ({
    ...(await vi.importActual("@uva-fnwi/datanose-ui")),
    useToast: () => toast,
}));
// Exercise the modal's selection/validation without depending on calendar keyboard interactions.
vi.mock("~/components/Datepicker/Datepicker", () => ({
    DatePicker: ({
        label,
        value,
        highlightedDate,
        onChange,
    }: {
        label: string;
        value: Date | null;
        highlightedDate?: Date;
        onChange: (date: Date | null) => void;
    }) => (
        <label>
            {label}
            <input
                type="date"
                data-highlighted-date={highlightedDate && format(highlightedDate, "yyyy-MM-dd")}
                value={value ? format(value, "yyyy-MM-dd") : ""}
                onChange={(event) =>
                    onChange(event.target.value ? parseISO(event.target.value) : null)
                }
            />
        </label>
    ),
}));

afterEach(cleanup);
beforeEach(async () => {
    vi.clearAllMocks();
    await translations.changeLanguage("en");
    postpone.mockReturnValue({unwrap: () => Promise.resolve()});
});

function openModal(courseName = "bachelor's thesis") {
    render(
        <PostponeDeadlinesControl
            instanceId="instance"
            deadlines={deadlines}
            studentName="Alex Student"
            courseName={courseName}
        />,
    );
    fireEvent.click(screen.getByRole("button", {name: "postpone.title"}));
}

async function selectReason(name: keyof typeof en.postpone.reasons) {
    fireEvent.click(screen.getByRole("button", {name: /postpone.reason/}));
    fireEvent.click(
        await screen.findByRole("option", {name: translations.t(`postpone.reasons.${name}`)}),
    );
}

describe("Postpone deadlines", () => {
    it.each([
        [
            "en",
            "bachelor's thesis",
            "You are about to grant Alex Student an extension for the bachelor's thesis.",
        ],
        [
            "en",
            "master's thesis",
            "You are about to grant Alex Student an extension for the master's thesis.",
        ],
        [
            "nl",
            "bachelorscriptie",
            "Je wilt Alex Student voor de bachelorscriptie uitstel verlenen.",
        ],
        ["nl", "masterscriptie", "Je wilt Alex Student voor de masterscriptie uitstel verlenen."],
        [
            "en",
            "Master's thesis (Art_Design)",
            "You are about to grant Alex Student an extension for the Master's thesis (Art_Design).",
        ],
    ])("describes the extension in %s for %s", async (language, course, description) => {
        await translations.changeLanguage(language);
        openModal(course);
        const student = screen.getByText("Alex Student");
        expect(student.tagName).toBe("STRONG");
        expect(screen.getByText(course).tagName).toBe("STRONG");
        expect(student.closest("p")).toHaveTextContent(description);
    });

    it.each(["en", "nl"])("shows the callout and all reason options in %s", async (language) => {
        await translations.changeLanguage(language);
        openModal();
        const resources = language === "nl" ? nl : en;
        const title = screen.getByText(resources.postpone.examination_board_title);
        expect(screen.getByText(resources.postpone.examination_board_body)).toBeInTheDocument();
        const select = screen.getByRole("button", {name: /postpone.reason/});
        expect(
            title.compareDocumentPosition(select) & Node.DOCUMENT_POSITION_FOLLOWING,
        ).toBeTruthy();
        expect(screen.queryByRole("textbox")).not.toBeInTheDocument();
        fireEvent.click(select);
        await screen.findByRole("listbox");
        expect(screen.getAllByRole("option")).toHaveLength(10);
        for (const label of Object.values(resources.postpone.reasons))
            expect(screen.getByRole("option", {name: label})).toBeInTheDocument();
    });

    it("opens with empty dates and requires a later date and a nonblank Other description", async () => {
        openModal();
        expect(screen.getByLabelText("Submission")).toHaveValue("");
        expect(screen.getByLabelText("Assessment")).toHaveValue("");
        expect(screen.getByLabelText("Submission")).toHaveAttribute(
            "data-highlighted-date",
            "2026-10-01",
        );
        expect(screen.getByLabelText("Assessment")).toHaveAttribute(
            "data-highlighted-date",
            "2026-10-02",
        );
        const confirm = screen.getByRole("button", {name: "postpone.confirm"});
        expect(confirm).toBeDisabled();
        await selectReason("Other");
        fireEvent.change(screen.getByLabelText("Submission"), {target: {value: "2026-10-01"}});
        fireEvent.change(screen.getByRole("textbox", {name: "postpone.explanation"}), {
            target: {value: "because"},
        });
        expect(confirm).toBeDisabled();
        fireEvent.change(screen.getByLabelText("Submission"), {target: {value: "2026-09-30"}});
        expect(confirm).toBeDisabled();
        fireEvent.change(screen.getByLabelText("Submission"), {target: {value: "2026-10-03"}});
        fireEvent.change(screen.getByRole("textbox", {name: "postpone.explanation"}), {
            target: {value: "   "},
        });
        expect(confirm).toBeDisabled();
        fireEvent.change(screen.getByRole("textbox", {name: "postpone.explanation"}), {
            target: {value: "because"},
        });
        expect(confirm).toBeEnabled();
    });

    it("sends only changed dates and the trimmed reason, and resets cancelled input", async () => {
        openModal();
        await selectReason("Other");
        fireEvent.change(screen.getByLabelText("Submission"), {target: {value: "2026-10-03"}});
        fireEvent.change(screen.getByRole("textbox", {name: "postpone.explanation"}), {
            target: {value: "  illness  "},
        });
        fireEvent.click(screen.getByRole("button", {name: "cancel"}));
        expect(postpone).not.toHaveBeenCalled();
        fireEvent.click(screen.getByRole("button", {name: "postpone.title"}));
        expect(screen.getByLabelText("Submission")).toHaveValue("");
        expect(screen.getByLabelText("Assessment")).toHaveValue("");
        expect(screen.queryByRole("textbox")).not.toBeInTheDocument();
        expect(screen.getByRole("button", {name: "postpone.confirm"})).toBeDisabled();
        await selectReason("Other");
        expect(screen.getByRole("textbox", {name: "postpone.explanation"})).toHaveValue("");
        fireEvent.change(screen.getByLabelText("Assessment"), {target: {value: "2026-10-05"}});
        fireEvent.change(screen.getByRole("textbox", {name: "postpone.explanation"}), {
            target: {value: "  illness  "},
        });
        fireEvent.click(screen.getByRole("button", {name: "postpone.confirm"}));
        await waitFor(() => expect(toast.success).toHaveBeenCalled());
        expect(postpone).toHaveBeenCalledWith({
            instanceId: "instance",
            reason: "illness",
            changes: [{property: "OtherDate", currentDate: "2026-10-02", date: "2026-10-05"}],
        });
    });

    it.each(["en", "nl"])(
        "saves the selected reason in %s without a description",
        async (language) => {
            await translations.changeLanguage(language);
            openModal();
            const submissionLabel = language === "nl" ? "Inleveren" : "Submission";
            fireEvent.change(screen.getByLabelText(submissionLabel), {
                target: {value: "2026-10-03"},
            });
            expect(screen.getByRole("button", {name: "postpone.confirm"})).toBeDisabled();
            await selectReason("Other");
            fireEvent.change(screen.getByRole("textbox", {name: "postpone.explanation"}), {
                target: {value: "unused explanation"},
            });
            await selectReason("HealthAndWellbeing");
            expect(screen.queryByRole("textbox")).not.toBeInTheDocument();
            fireEvent.click(screen.getByRole("button", {name: "postpone.confirm"}));
            await waitFor(() => expect(toast.success).toHaveBeenCalled());
            expect(postpone).toHaveBeenCalledWith({
                instanceId: "instance",
                reason: (language === "nl" ? nl : en).postpone.reasons.HealthAndWellbeing,
                changes: [{property: "DueDate", currentDate: "2026-10-01", date: "2026-10-03"}],
            });
        },
    );

    it("refreshes the available deadlines after a concurrent change", async () => {
        postpone.mockReturnValue({
            unwrap: () => Promise.reject({data: {errorCode: "DeadlineChanged"}}),
        });
        openModal();
        await selectReason("AcademicProblems");
        fireEvent.change(screen.getByLabelText("Submission"), {target: {value: "2026-10-03"}});
        fireEvent.click(screen.getByRole("button", {name: "postpone.confirm"}));
        await waitFor(() =>
            expect(dispatch).toHaveBeenCalledWith({
                type: "invalidate",
                payload: [{type: "Instance", id: "instance"}],
            }),
        );
        expect(toast.warning).toHaveBeenCalledWith("postpone.deadline_changed");
    });
});
