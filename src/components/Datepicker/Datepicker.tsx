import {useTranslation} from "react-i18next";

import {
    DatePicker as UIDatePicker,
    DateRangePicker as UIDateRangePicker,
} from "@uva-fnwi/datanose-ui";
import type {DatePickerProps, DateRangePickerProps} from "@uva-fnwi/datanose-ui";

/**
 * Locale-aware DatePicker wrapper that automatically syncs with i18n language
 */
export const DatePicker = (props: Omit<DatePickerProps, "locale">) => {
    const {i18n} = useTranslation();

    const locale = i18n.language === "nl" ? "nl-NL" : "en-GB";

    return <UIDatePicker {...props} locale={locale} />;
};

/**
 * Locale-aware DateRangePicker wrapper that automatically syncs with i18n language
 */
export const DateRangePicker = (props: Omit<DateRangePickerProps, "locale">) => {
    const {i18n} = useTranslation();

    const locale = i18n.language === "nl" ? "nl-NL" : "en-GB";

    return <UIDateRangePicker {...props} locale={locale} />;
};
