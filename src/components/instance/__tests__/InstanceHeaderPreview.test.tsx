import {cleanup, fireEvent, render, screen, within} from "@testing-library/react";
import {afterEach, expect, it, vi} from "vitest";

import {InstanceHeader} from "../InstanceHeader";

vi.mock("~/hooks/useTranslate", () => ({
    useTranslate: () => ({
        t: (key: string) => key,
        l: (value?: {en: string} | null) => value?.en ?? "",
    }),
}));
vi.mock("~/store/store", () => ({useAppSelector: () => "/"}));
vi.mock("~/components/PageHeader", () => ({
    PageHeader: ({
        actions,
        description,
    }: {
        actions: React.ReactNode;
        description: React.ReactNode;
    }) => (
        <div>
            {description}
            <div data-testid="pinned-actions">{actions}</div>
        </div>
    ),
}));
vi.mock("../HighlightedFields.tsx", () => ({HighlightedFields: () => <p>Project details</p>}));
vi.mock("../ActionModal", () => ({ActionModal: () => null}));
vi.mock("../FormPreviewModal", () => ({FormPreviewModal: () => <div role="dialog">Preview</div>}));
afterEach(cleanup);

it("hides the preview entry when the API grants no forms or omits preview support", () => {
    render(<InstanceHeader instanceId="instance" isLoading={false} />);
    expect(
        screen.queryByRole("button", {name: "form_preview.entry_point"}),
    ).not.toBeInTheDocument();
});

it("opens the generic preview entry independently of pinned actions", () => {
    render(
        <InstanceHeader
            instanceId="instance"
            isLoading={false}
            previewableForms={[{name: "Review", title: {en: "Review", nl: "Review"}}]}
        />,
    );
    fireEvent.click(screen.getByRole("button", {name: "form_preview.entry_point"}));
    expect(screen.getByRole("dialog")).toBeInTheDocument();
});

it("places preview after global actions and announces a dialog", () => {
    render(
        <InstanceHeader
            instanceId="instance"
            isLoading={false}
            previewableForms={[{name: "Review", title: {en: "Review", nl: "Review"}}]}
            pinnedActions={[
                {
                    id: "EditProject",
                    name: "EditProject",
                    type: "Execute",
                    title: {en: "Edit project", nl: "Project bewerken"},
                    intent: "Secondary",
                    steps: [],
                    formLayout: "Modal",
                },
            ]}
        />,
    );
    const preview = screen.getByRole("button", {name: "form_preview.entry_point"});
    expect(preview).toHaveAttribute("aria-haspopup", "dialog");
    const edit = within(screen.getByTestId("pinned-actions")).getByRole("button", {
        name: "Edit project",
    });
    expect(edit).toBeVisible();
    expect(screen.getByTestId("pinned-actions")).toContainElement(preview);
    expect(edit.compareDocumentPosition(preview) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
});

it("keeps preview hidden while the project is loading", () => {
    render(
        <InstanceHeader
            instanceId="instance"
            isLoading
            previewableForms={[{name: "Review", title: {en: "Review", nl: "Review"}}]}
        />,
    );
    expect(
        screen.queryByRole("button", {name: "form_preview.entry_point"}),
    ).not.toBeInTheDocument();
});
