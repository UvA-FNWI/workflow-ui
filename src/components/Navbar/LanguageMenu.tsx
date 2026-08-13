import {MenuItem} from "@uva-fnwi/datanose-ui";

import enFlag from "~/assets/EN.svg";
import nlFlag from "~/assets/NL.svg";
import {useTranslate} from "~/hooks/useTranslate";

type Language = "en" | "nl";

const languageFlags: Record<Language, string> = {
    en: enFlag,
    nl: nlFlag,
};

const languages: Language[] = ["en", "nl"];

export function useLanguageMenuItem() {
    const {i18n, t} = useTranslate("common");
    const language: Language = i18n.language.startsWith("nl") ? "nl" : "en";

    return (
        <MenuItem
            key="language"
            id="language"
            textValue={t("language")}
            icon={
                <img
                    src={languageFlags[language]}
                    alt=""
                    aria-hidden="true"
                    className="h-6 w-6 shrink-0"
                />
            }
            label={`${t("language")}: ${t(`language_${language}`)}`}
            selectionMode="single"
            selectedKeys={[language]}
        >
            {languages.map((option) => (
                <MenuItem
                    key={option}
                    id={option}
                    textValue={t(`language_${option}`)}
                    onAction={() => void i18n.changeLanguage(option)}
                    icon={
                        <img
                            src={languageFlags[option]}
                            alt=""
                            aria-hidden="true"
                            className="h-6 w-6 shrink-0"
                        />
                    }
                    label={t(`language_${option}`)}
                />
            ))}
        </MenuItem>
    );
}
