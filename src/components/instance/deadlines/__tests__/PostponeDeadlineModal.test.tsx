import {useState} from "react";

import {cleanup, fireEvent, render, screen, waitFor, within} from "@testing-library/react";
import {afterEach, beforeEach, expect, it, vi} from "vitest";

import {PostponeDeadlineModal} from "../PostponeDeadlineModal";
import type {ExtendableDeadline} from "~/store/api/types/deadlines";
import type {Form} from "~/store/api/types/submissions";

const {postpone} = vi.hoisted(() => ({postpone: vi.fn()}));
vi.mock("react-i18next", () => ({useTranslation: () => ({i18n: {language: "en"}})}));
vi.mock("~/hooks/useTranslate", () => ({
    useTranslate: () => ({
        t: (key: string) => key,
        l: (value: {en: string}) => value.en,
        i18n: {language: "en"},
    }),
}));
vi.mock("~/store/api/deadlinesApi", () => ({
    deadlinesApi: {
        endpoints: {
            postponeDeadlines: {
                useMutation: () => {
                    const [error, setError] = useState<unknown>();
                    return [
                        async (input: unknown) => {
                            setError(undefined);
                            const result = await postpone(input);
                            setError(result.error);
                            return result;
                        },
                        {isLoading: false, error},
                    ];
                },
            },
        },
    },
}));
const deadlines: ExtendableDeadline[] = [
    {
        property: "Deadline",
        title: {en: "Proposal", nl: "Voorstel"},
        date: "2027-01-01T12:00:00+01:00",
    },
];
const props = {
    instanceId: "instance",
    actionName: "GrantExtension",
    form: {
        name: "ExtensionDialog",
        type: "PostponeDeadline",
        layout: "Modal",
        title: {en: "Configured modal title", nl: "Ingestelde modaltitel"},
        pages: [
            {
                name: "Reason",
                questions: [
                    {
                        name: "Reason",
                        type: "Choice",
                        text: {en: "Configured reason"},
                        choices: [
                            {name: "Research", text: {en: "Research delay"}},
                            {name: "Other", text: {en: "Other"}},
                        ],
                    },
                    {name: "Explanation", type: "String", text: {en: "Configured explanation"}},
                ],
            },
        ],
    } as Form,
    deadlines,
    onClose: vi.fn(),
};
beforeEach(() => {
    postpone.mockReset().mockResolvedValue({data: {}});
    props.onClose.mockReset();
    vi.useFakeTimers({toFake: ["Date"]});
    vi.setSystemTime(new Date(2027, 0, 10));
});
afterEach(() => {
    cleanup();
    vi.useRealTimers();
});
function chooseDates() {
    fireEvent.click(screen.getByRole("radio", {name: "postponement.all"}));
    fireEvent.change(screen.getByLabelText("postponement.amount"), {target: {value: "7"}});
}
async function chooseReason(name: string) {
    fireEvent.click(screen.getByRole("button", {name: /Configured reason/}));
    fireEvent.click(await screen.findByRole("option", {name}));
}

it("starts without a reason and submits all input together through the dedicated endpoint", async () => {
    render(<PostponeDeadlineModal {...props} />);
    expect(screen.getByText("Configured modal title")).toBeInTheDocument();
    expect(screen.getByText("postponement.introduction")).toBeInTheDocument();
    expect(screen.queryByRole("button", {name: /Configured reason/})).not.toBeInTheDocument();
    chooseDates();
    expect(screen.getByRole("button", {name: "confirm"})).toBeDisabled();
    await chooseReason("Research delay");
    expect(postpone).not.toHaveBeenCalled();
    fireEvent.click(screen.getByRole("button", {name: "confirm"}));
    await waitFor(() => expect(props.onClose).toHaveBeenCalledOnce());
    expect(postpone).toHaveBeenCalledWith({
        instanceId: "instance",
        actionName: "GrantExtension",
        request: {
            reason: "Research delay",
            changes: [
                {property: "Deadline", previousDate: deadlines[0].date, newDate: "2027-01-08"},
            ],
        },
    });
});

it("requires an explanation only for Other and sends its trimmed value", async () => {
    render(<PostponeDeadlineModal {...props} />);
    chooseDates();
    await chooseReason("Other");
    expect(screen.getByRole("button", {name: "confirm"})).toBeDisabled();
    fireEvent.change(screen.getByLabelText("Configured explanation"), {target: {value: "   "}});
    expect(screen.getByRole("button", {name: "confirm"})).toBeDisabled();
    fireEvent.change(screen.getByLabelText("Configured explanation"), {
        target: {value: "  Waiting for data  "},
    });
    fireEvent.click(screen.getByRole("button", {name: "confirm"}));
    await waitFor(() => expect(postpone).toHaveBeenCalledOnce());
    expect(postpone.mock.lastCall?.[0].request.reason).toBe("Other\nWaiting for data");
    expect(postpone.mock.lastCall?.[0].request).not.toHaveProperty("explanation");
});

it("cancel saves nothing and reopening starts with a blank reason", async () => {
    const {unmount} = render(<PostponeDeadlineModal {...props} />);
    chooseDates();
    await chooseReason("Other");
    fireEvent.change(screen.getByLabelText("Configured explanation"), {target: {value: "Draft"}});
    fireEvent.click(screen.getByRole("button", {name: "cancel"}));
    expect(postpone).not.toHaveBeenCalled();
    unmount();
    render(<PostponeDeadlineModal {...props} />);
    chooseDates();
    expect(screen.getByRole("button", {name: "confirm"})).toBeDisabled();
    expect(screen.queryByLabelText("Configured explanation")).not.toBeInTheDocument();
});

it("keeps selected dates and displays server validation errors in the modal", async () => {
    postpone.mockResolvedValueOnce({
        error: {status: 422, data: ["InvalidChanges"]},
    });
    render(<PostponeDeadlineModal {...props} />);
    chooseDates();
    await chooseReason("Research delay");
    fireEvent.click(screen.getByRole("button", {name: "confirm"}));
    expect(await screen.findByText("postponement.errors.InvalidChanges")).toBeInTheDocument();
    expect(props.onClose).not.toHaveBeenCalled();
    expect(screen.getByLabelText("postponement.amount")).toHaveValue(7);
    fireEvent.click(screen.getByRole("button", {name: "confirm"}));
    await waitFor(() => expect(props.onClose).toHaveBeenCalledOnce());
    expect(screen.queryByText("postponement.errors.InvalidChanges")).not.toBeInTheDocument();
});

it("opens a future deadline at a valid month and accepts its first selection", async () => {
    const future = [{...deadlines[0], date: "2028-12-02T12:00:00+01:00"}];
    render(<PostponeDeadlineModal {...props} deadlines={future} />);
    fireEvent.click(screen.getByRole("radio", {name: "postponement.individual"}));
    const picker = screen.getByRole("group", {name: "postponement.new_date: Proposal"});
    fireEvent.click(within(picker).getByRole("button"));
    const calendar = await screen.findByRole("grid", {name: "December 2028"});
    expect(
        within(calendar).getByRole("button", {name: /Saturday, 2 December 2028/}),
    ).toHaveAttribute("aria-disabled", "true");
    fireEvent.click(within(calendar).getByRole("button", {name: /Sunday, 3 December 2028/}));
    await chooseReason("Research delay");
    fireEvent.click(screen.getByRole("button", {name: "confirm"}));
    await waitFor(() => expect(postpone).toHaveBeenCalledOnce());
    expect(postpone.mock.lastCall?.[0].request.changes[0].newDate).toBe("2028-12-03");
});

it("clears the explanation when switching reasons", async () => {
    render(<PostponeDeadlineModal {...props} />);
    chooseDates();
    await chooseReason("Other");
    fireEvent.change(screen.getByLabelText("Configured explanation"), {
        target: {value: "Old explanation"},
    });
    await chooseReason("Research delay");
    expect(screen.queryByLabelText("Configured explanation")).not.toBeInTheDocument();
    await chooseReason("Other");
    expect(screen.getByLabelText("Configured explanation")).toHaveValue("");
    expect(screen.getByRole("button", {name: "confirm"})).toBeDisabled();
});
