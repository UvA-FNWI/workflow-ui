import {cleanup, fireEvent, render, screen, waitFor} from "@testing-library/react";
import {format, parseISO} from "date-fns";
import {afterEach, beforeEach, describe, expect, it, vi} from "vitest";

import {PostponeDeadlinesControl} from "../PostponeDeadlinesControl";

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
        t: (key: string) => key,
        l: (value: {en: string}) => value.en,
        i18n: {language: "en"},
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
        onChange,
    }: {
        label: string;
        value: Date | null;
        onChange: (date: Date | null) => void;
    }) => (
        <label>
            {label}
            <input
                type="date"
                value={value ? format(value, "yyyy-MM-dd") : ""}
                onChange={(event) =>
                    onChange(event.target.value ? parseISO(event.target.value) : null)
                }
            />
        </label>
    ),
}));

afterEach(cleanup);
beforeEach(() => {
    vi.clearAllMocks();
    postpone.mockReturnValue({unwrap: () => Promise.resolve()});
});

function openModal() {
    render(<PostponeDeadlinesControl instanceId="instance" deadlines={deadlines} />);
    fireEvent.click(screen.getByRole("button", {name: "postpone.title"}));
}

describe("Postpone deadlines", () => {
    it("requires a selected later date and a nonblank reason", () => {
        openModal();
        const confirm = screen.getByRole("button", {name: "postpone.confirm"});
        expect(confirm).toBeDisabled();
        fireEvent.change(screen.getByLabelText("Submission"), {target: {value: "2026-10-01"}});
        fireEvent.change(screen.getByRole("textbox", {name: "postpone.reason"}), {
            target: {value: "because"},
        });
        expect(confirm).toBeDisabled();
        fireEvent.change(screen.getByLabelText("Submission"), {target: {value: "2026-09-30"}});
        expect(confirm).toBeDisabled();
        fireEvent.change(screen.getByLabelText("Submission"), {target: {value: "2026-10-03"}});
        fireEvent.change(screen.getByRole("textbox", {name: "postpone.reason"}), {
            target: {value: "   "},
        });
        expect(confirm).toBeDisabled();
        fireEvent.change(screen.getByRole("textbox", {name: "postpone.reason"}), {
            target: {value: "because"},
        });
        expect(confirm).toBeEnabled();
    });

    it("sends only selected dates and the trimmed reason, and clears cancelled input", async () => {
        openModal();
        fireEvent.change(screen.getByLabelText("Submission"), {target: {value: "2026-10-03"}});
        fireEvent.change(screen.getByRole("textbox", {name: "postpone.reason"}), {
            target: {value: "  illness  "},
        });
        fireEvent.click(screen.getByRole("button", {name: "cancel"}));
        expect(postpone).not.toHaveBeenCalled();
        fireEvent.click(screen.getByRole("button", {name: "postpone.title"}));
        expect(screen.getByRole("button", {name: "postpone.confirm"})).toBeDisabled();
        fireEvent.change(screen.getByLabelText("Assessment"), {target: {value: "2026-10-05"}});
        fireEvent.change(screen.getByRole("textbox", {name: "postpone.reason"}), {
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

    it("refreshes the available deadlines after a concurrent change", async () => {
        postpone.mockReturnValue({
            unwrap: () => Promise.reject({data: {errorCode: "DeadlineChanged"}}),
        });
        openModal();
        fireEvent.change(screen.getByLabelText("Submission"), {target: {value: "2026-10-03"}});
        fireEvent.change(screen.getByRole("textbox", {name: "postpone.reason"}), {
            target: {value: "because"},
        });
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
