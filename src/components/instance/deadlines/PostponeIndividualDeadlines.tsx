import {PostponeDeadlineField} from "./PostponeDeadlineField";
import type {ExtendableDeadline} from "~/store/api/types/deadlines";

type Props = {
    deadlines: ExtendableDeadline[];
    dates: Record<string, string>;
    onDateChange: (property: string, value: string) => void;
};

export function PostponeIndividualDeadlines({deadlines, dates, onDateChange}: Props) {
    return (
        <>
            {deadlines.map((deadline) => (
                <PostponeDeadlineField
                    key={deadline.property}
                    deadline={deadline}
                    value={dates[deadline.property] ?? ""}
                    onChange={(value) => onDateChange(deadline.property, value)}
                />
            ))}
        </>
    );
}
