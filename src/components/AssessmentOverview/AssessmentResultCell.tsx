import type {PropsWithChildren, ReactNode} from "react";

type Props = PropsWithChildren<{
    showMessageColumn: boolean;
    messageButton?: ReactNode;
}>;

export const AssessmentResultCell = ({children, showMessageColumn, messageButton}: Props) => (
    <div className="flex w-max items-start gap-1">
        {showMessageColumn && <div className="w-5 shrink-0">{messageButton}</div>}
        <div className="w-24 min-w-0 shrink-0 sm:w-32">{children}</div>
    </div>
);
