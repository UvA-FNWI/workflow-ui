import {useTranslation} from "react-i18next";

import {DatePicker as UIDatePicker} from "@datanose/ui";
import type {DatePickerProps} from "@datanose/ui";

/**
 * Locale-aware DatePicker wrapper that automatically syncs with i18n language
 */
export const DatePicker = (props: Omit<DatePickerProps, "locale">) => {
    const {i18n} = useTranslation();

    const locale = i18n.language === "nl" ? "nl-NL" : "en-GB";

    return <UIDatePicker {...props} locale={locale} />;
};
