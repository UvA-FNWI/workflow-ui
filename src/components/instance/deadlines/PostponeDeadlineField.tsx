import {dateToDateValue, Text} from "@uva-fnwi/datanose-ui";
import {format, parseISO} from "date-fns";

import {deadlineDate} from "./postponeDeadline";
import {DatePicker} from "~/components/Datepicker/Datepicker";
import {useTranslate} from "~/hooks/useTranslate";
import type {ExtendableDeadline} from "~/store/api/types/deadlines";
import {formatDateShortWithRelevantTime} from "~/utils/formatDate";

type Props = {
    deadline: ExtendableDeadline;
    value: string;
    onChange: (value: string) => void;
};

export function PostponeDeadlineField({deadline, value, onChange}: Props) {
    const {t, l, i18n} = useTranslate("workflow");
    const limitReached =
        deadline.maxDate != null && deadline.maxDate <= deadlineDate(deadline.date);
    return (
        <div className="flex flex-col gap-2 border-b border-grey-200 pb-4">
            <Text fontWeight="semibold" className="uppercase">
                {l(deadline.title)}
            </Text>
            <div className="grid grid-cols-2 items-center gap-x-3 gap-y-2">
                <Text fontWeight="semibold">{t("postponement.current_date")}</Text>
                <Text fontWeight="semibold">{t("postponement.new_date")}</Text>
                <Text>{formatDateShortWithRelevantTime(deadline.date, i18n.language)}</Text>
                {limitReached ? (
                    <Text>{t("postponement.limit_reached")}</Text>
                ) : (
                    <DatePicker
                        aria-label={t("postponement.new_date") + ": " + l(deadline.title)}
                        // Start the calendar at a selectable date, even for future deadlines.
                        minValue={dateToDateValue(parseISO(deadlineDate(deadline.date)))?.add({
                            days: 1,
                        })}
                        maxValue={
                            deadline.maxDate
                                ? dateToDateValue(parseISO(deadline.maxDate))
                                : undefined
                        }
                        value={value ? parseISO(value) : null}
                        onChange={(date) => {
                            // DatePicker uses local dates; preserve the selected calendar day.
                            onChange(date ? format(date, "yyyy-MM-dd") : "");
                        }}
                    />
                )}
            </div>
        </div>
    );
}
