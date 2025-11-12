import {defineConfig} from "i18next-cli";

export default defineConfig({
    locales: ["en", "nl"],
    extract: {
        input: "src/**/*.{js,jsx,ts,tsx}",
        output: "public/locales/{{language}}/{{namespace}}.json",
        defaultNS: "common",
        defaultValue: "$TODO$",
    },
    types: {
        input: ["public/locales/**/*.json"],
        output: "src/types/i18next.d.ts",
        resourcesFile: "src/types/resources.d.ts",
    },
});
