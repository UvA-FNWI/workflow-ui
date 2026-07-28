import {useTranslate} from "~/hooks/useTranslate";
import type {ProgressInformation} from "~/store/api/types/progress";

type ProgressCellProps = {
    progress: ProgressInformation;
};

export function ProgressCell({progress}: ProgressCellProps) {
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
