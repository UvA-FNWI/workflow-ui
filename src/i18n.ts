import {initReactI18next} from "react-i18next";

import i18n from "i18next";
import LanguageDetector from "i18next-browser-languagedetector";
import Backend from "i18next-http-backend";

i18n.use(Backend)
    .use(LanguageDetector)
    .use(initReactI18next)
    .init({
        backend: {
            loadPath: "/locales/{{lng}}/{{ns}}.json",
        },
        ns: ["common", "workflow", "jobs", "personal"],
        defaultNS: "common",
        debug: true,
        fallbackLng: "en",
        supportedLngs: ["en", "nl"],
        interpolation: {
            escapeValue: false,
        },
    });

export default i18n;
