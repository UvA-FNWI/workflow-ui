import js from "@eslint/js";
import reactHooks from "eslint-plugin-react-hooks";
import reactRefresh from "eslint-plugin-react-refresh";
import {defineConfig, globalIgnores} from "eslint/config";
import globals from "globals";
import tseslint from "typescript-eslint";

export default defineConfig([
    globalIgnores(["dist", "packages/*"]),
    {
        files: ["**/*.{ts,tsx}"],
        extends: [js.configs.recommended, tseslint.configs.recommended, reactRefresh.configs.vite],
        plugins: {
            "react-hooks": reactHooks,
        },
        languageOptions: {
            ecmaVersion: 2020,
            globals: globals.browser,
            parser: tseslint.parser,
            parserOptions: {
                tsconfigRootDir: import.meta.dirname,
                project: ["./tsconfig.app.json", "./tsconfig.node.json"],
            },
        },
        rules: {
            ...reactHooks.configs.recommended.rules,
        },
    },
]);
