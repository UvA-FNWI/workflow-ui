import {Icon} from "@uva-fnwi/datanose-ui";
import type {MenuItemDefinition} from "@uva-fnwi/datanose-ui";

import enFlag from "~/assets/EN.svg";
import nlFlag from "~/assets/NL.svg";
import {useTranslate} from "~/hooks/useTranslate";

type Language = "en" | "nl";

const languageFlags: Record<Language, string> = {
    en: enFlag,
    nl: nlFlag,
};

const languages: Language[] = ["en", "nl"];

export function useLanguageMenuItem(): MenuItemDefinition {
    const {i18n, t} = useTranslate("common");
    const language: Language = i18n.language.startsWith("nl") ? "nl" : "en";

    return {
        id: "language",
        textValue: t("language"),
        icon: (
            <img
                src={languageFlags[language]}
                alt=""
                aria-hidden="true"
                className="h-6 w-6 shrink-0"
            />
        ),
        content: (
            <span className="min-w-0 flex-1 truncate">
                {t("language")}: {t(`language_${language}`)}
            </span>
        ),
        submenu: {
            ariaLabel: t("language"),
            selectionMode: "single",
            selectedKeys: [language],
            items: languages.map((option) => ({
                id: option,
                textValue: t(`language_${option}`),
                onAction: () => void i18n.changeLanguage(option),
                icon: (
                    <img
                        src={languageFlags[option]}
                        alt=""
                        aria-hidden="true"
                        className="h-6 w-6 shrink-0"
                    />
                ),
                content: ({isSelected}) => (
                    <>
                        <span className="min-w-0 flex-1 truncate">{t(`language_${option}`)}</span>
                        {isSelected && (
                            <Icon name="checkmark-solid" size="sm" color="current" decorative />
                        )}
                    </>
                ),
            })),
        },
    };
}
