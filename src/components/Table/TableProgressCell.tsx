import {useTranslate} from "~/hooks/useTranslate";
import type {ProgressInformation} from "~/store/api/types/progress";

type TableProgressCellProps = {
    progress: ProgressInformation;
    workflowStopped?: boolean;
};

export function TableProgressCell({progress, workflowStopped}: TableProgressCellProps) {
    const {l} = useTranslate("workflow");

    if (workflowStopped) {
        return <span className="font-bold">{l(progress.text)}</span>;
    }

    return (
        <div className="flex items-baseline gap-2">
            <div
                className={`h-2 min-w-2 rounded-full ${
                    progress.color?.toLowerCase() === "green" ? "bg-green-600" : "bg-red-600"
                }`}
            />
            <span>{l(progress.text)}</span>
        </div>
    );
}
