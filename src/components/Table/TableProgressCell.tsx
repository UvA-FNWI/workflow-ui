import {useTranslate} from "~/hooks/useTranslate";
import type {ProgressInformation} from "~/store/api/types/progress";

type TableProgressCellProps = {
    progress: ProgressInformation;
};

export function TableProgressCell({progress}: TableProgressCellProps) {
    const {l} = useTranslate("workflow");

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
