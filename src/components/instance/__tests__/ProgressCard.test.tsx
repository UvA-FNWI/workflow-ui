import {cleanup, render, screen} from "@testing-library/react";
import {afterEach, expect, it, vi} from "vitest";

import {ProgressCard} from "../ProgressCard";

vi.mock("~/components/WorkflowProgressBar", () => ({WorkflowProgressBar: () => null}));

vi.mock("~/hooks/useTranslate", () => ({
    useTranslate: () => ({l: (value?: {en: string}) => value?.en}),
}));

afterEach(cleanup);

it.each([
    ["Pause", "ui:bg-grey-300"],
    ["Cancel", "ui:bg-red-200"],
    [null, "ui:bg-red-200"],
] as const)("styles a progress pill for stop event %s", (eventId, colorClass) => {
    render(
        <ProgressCard
            card={{name: "progress", type: "Progress", title: {en: "Progress", nl: "Voortgang"}}}
            isLoading={false}
            steps={[]}
            currentStep=""
            stoppedProgress={{text: {en: "Status", nl: "Status"}, color: "Red", eventId}}
        />,
    );

    expect(screen.getByText("Status")).toHaveClass(colorClass);
});
