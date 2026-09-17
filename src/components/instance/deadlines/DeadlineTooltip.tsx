import {Icon, Tooltip} from "@uva-fnwi/datanose-ui";
import i18n from "i18next";

import {useTranslate} from "~/hooks/useTranslate.ts";
import {formatDateShortWithRelevantTime} from "~/utils/formatDate.ts";

type Props = {previousDate: string; reason?: string | null};

export function DeadlineTooltip({previousDate, reason}: Props) {
    const {t} = useTranslate("workflow");

    return (
        <Tooltip
            className="max-w-xs whitespace-pre-line!"
            content={
                <>
                    <span className="block">
                        {t("progress.previous_deadline")}:{" "}
                        {formatDateShortWithRelevantTime(
                            previousDate,
                            i18n.language,
                            `(${t("progress.amsterdam_time")})`,
                        )}
                    </span>
                    <span className="block">
                        {t("progress.deadline_change_reason")}:{" "}
                        {reason || t("progress.deadline_reason_unknown")}
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
