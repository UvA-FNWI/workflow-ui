import react from "@vitejs/plugin-react";
import path from "path";
import {defineConfig} from "vite";
import dts from "vite-plugin-dts";

export default defineConfig({
    plugins: [
        react(),
        dts({
            insertTypesEntry: true,
        }),
    ],
    build: {
        lib: {
            entry: {
                core: path.resolve(__dirname, "src/index.ts"),
                redux: path.resolve(__dirname, "src/redux/index.ts"),
            },
            name: "DataNoseCore",
            fileName: (format, entryName) =>
                entryName === "redux"
                    ? `redux/${entryName}.${format}.js`
                    : `${entryName}.${format}.js`,
        },
        rollupOptions: {
            external: ["react", "react-dom", "@reduxjs/toolkit", "redux"],
            output: {
                globals: {
                    react: "React",
                    "react-dom": "ReactDOM",
                    redux: "Redux",
                    "@reduxjs/toolkit": "RTK",
                },
            },
        },
    },
});
