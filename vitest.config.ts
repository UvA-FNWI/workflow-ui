import path from "path";
import {defineConfig} from "vitest/config";

export default defineConfig({
    resolve: {
        alias: [
            {
                find: /^@uva-fnwi\/datanose-ui$/,
                replacement: path.resolve(__dirname, "packages/ui/src/index.ts"),
            },
            {find: "~", replacement: path.resolve(__dirname, "src")},
        ],
    },
    test: {
        environment: "jsdom",
        include: ["src/**/*.test.{ts,tsx}"],
        setupFiles: ["@testing-library/jest-dom/vitest"],
    },
});
