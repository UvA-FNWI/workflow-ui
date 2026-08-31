import {Input} from "@uva-fnwi/datanose-ui";

import {useTranslate} from "~/hooks/useTranslate";

/** Dutch and English side by side, because in this model every user-facing string is really two. */
export function BilingualPair({
    label,
    value,
    isDisabled,
    onChange,
}: {
    label: string;
    value: {nl: string; en: string};
    isDisabled?: boolean;
    onChange: (language: "nl" | "en", next: string) => void;
}) {
    const {t} = useTranslate("form_editor");

    return (
        <fieldset className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            <legend className="mb-1 text-sm font-medium text-grey-700">{label}</legend>
            {(["nl", "en"] as const).map((language) => (
                <Input
                    key={language}
                    label={language === "nl" ? t("language.nl") : t("language.en")}
                    value={value[language]}
                    isDisabled={isDisabled}
                    onChange={(next) => onChange(language, next)}
                />
            ))}
        </fieldset>
    );
}
