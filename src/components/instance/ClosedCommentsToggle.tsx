import {Checkbox} from "@uva-fnwi/datanose-ui";

import {useTranslate} from "~/hooks/useTranslate";

type Props = {
    closedCount: number;
    showClosed: boolean;
    onChange: (show: boolean) => void;
};

/** Same control on the instance Comments card and field comment modals. */
export function ClosedCommentsToggle({closedCount, showClosed, onChange}: Props) {
    const {t} = useTranslate("workflow");

    if (closedCount <= 0) return null;

    return (
        <Checkbox
            className="shrink-0"
            label={t("instance.messages.closed_count", {count: closedCount})}
            isSelected={showClosed}
            onChange={onChange}
        />
    );
}
