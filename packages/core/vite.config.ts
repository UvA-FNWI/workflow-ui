import react from "@vitejs/plugin-react";
import path from "path";
import dts from "vite-plugin-dts";
import {defineConfig} from "vitest/config";

export default defineConfig({
    test: {
        environment: "jsdom",
    },
    plugins: [
        react(),
        dts({
            insertTypesEntry: true,
            tsconfigPath: "./tsconfig.dts.json",
        }),
    ],
    build: {
        lib: {
            entry: {
                core: path.resolve(__dirname, "src/index.ts"),
            },
            name: "DataNoseCore",
            fileName: (format, entryName) => `${entryName}.${format}.js`,
        },
        rollupOptions: {
            external: [
                "react",
                "react/jsx-runtime",
                "react/jsx-dev-runtime",
                "react-dom",
                "react-dom/client",
            ],
            output: {
                globals: {
                    react: "React",
                    "react/jsx-runtime": "React",
                    "react/jsx-dev-runtime": "React",
                    "react-dom": "ReactDOM",
                    "react-dom/client": "ReactDOM",
                },
            },
        },
    },
});
