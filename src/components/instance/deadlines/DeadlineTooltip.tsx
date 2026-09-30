import {Icon, Tooltip} from "@uva-fnwi/datanose-ui";
import i18n from "i18next";

import type {LocalString} from "~/hooks/useTranslate";
import {useTranslate} from "~/hooks/useTranslate.ts";
import {formatDateShort} from "~/utils/formatDate.ts";

type Props = {previousDate: string; reason?: LocalString | null};

export function DeadlineTooltip({previousDate, reason}: Props) {
    const {t, l} = useTranslate("workflow");

    return (
        <Tooltip
            className="max-w-xs whitespace-pre-line!"
            content={
                <>
                    <span className="block">
                        {t("progress.previous_deadline")}:{" "}
                        {formatDateShort(previousDate, i18n.language)}
                    </span>
                    <span className="block">
                        {t("progress.deadline_change_reason")}:{" "}
                        {(reason && l(reason)) || t("progress.deadline_reason_unknown")}
                    </span>
                </>
            }
        >
            <Icon
                name="triangle-exclamation-line"
                color="danger"
                size="md"
                aria-label={t("progress.deadline_changed")}
            />
        </Tooltip>
    );
}
