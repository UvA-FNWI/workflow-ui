import {cn} from "@uva-fnwi/datanose-ui";

import {useTranslate} from "~/hooks/useTranslate";
import type {ProgressInformation} from "~/store/api/types/progress";

type TableProgressCellProps = {
    progress: ProgressInformation;
    workflowStopped?: boolean;
};

export function TableProgressCell({progress, workflowStopped}: TableProgressCellProps) {
    const {l} = useTranslate("workflow");

    const indicatorColor =
        progress.color?.toLowerCase() === "green" ? "bg-green-600" : "bg-red-600";

    return (
        <div className="flex items-baseline gap-2">
            <span
                aria-hidden="true"
                className={cn(
                    "h-2 w-2 shrink-0",
                    !workflowStopped && `rounded-full ${indicatorColor}`,
                )}
            />
            <span className={workflowStopped ? "font-bold" : undefined}>{l(progress.text)}</span>
        </div>
    );
}
