import {useTranslation} from "react-i18next";

export interface LocalString {
    en: string;
    nl: string;
}

export type UseTranslationParams = Parameters<typeof useTranslation>;

export const useTranslate = (...params: UseTranslationParams) => {
    const {t, i18n} = useTranslation(...params);

    return {
        t,
        l: (localString?: LocalString | null) =>
            i18n.language === "nl" ? localString?.nl : localString?.en,
        i18n,
    };
};
