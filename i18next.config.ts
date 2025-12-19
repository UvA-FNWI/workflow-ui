import {defineConfig} from "i18next-cli";

export default defineConfig({
    locales: ["en", "nl"],
    extract: {
        input: "src/**/*.{js,jsx,ts,tsx}",
        output: "public/locales/{{language}}/{{namespace}}.json",
        defaultNS: "common",
        defaultValue: "$TODO$",
        useTranslationNames: ["useTranslation", "useTranslate"],
        preservePatterns: ["*.dynamic.*"],
    },
});
