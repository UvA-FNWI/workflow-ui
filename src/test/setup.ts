import "@testing-library/jest-dom/vitest";
import {vi} from "vitest";

vi.mock("~/store/api/settingsApi", () => ({
    useGetSettingsQuery: () => ({data: undefined, isLoading: false, isError: false}),
}));

vi.mock("~/helpers/Environment", () => ({
    VITE_WEBAPI_URL: "http://api.test",
    VITE_ENV: "test",
    VITE_APP_NAME: "Test Register",
    VITE_AUTH_AUTHORITY: "http://auth.test",
    VITE_AUTH_CLIENT_ID: "client",
    VITE_AUTH_LOGOUT_URL: "http://logout.test",
    VITE_AUTO_REFRESH_CONFIG: "false",
}));

if (typeof globalThis.localStorage === "undefined") {
    const storage = new Map<string, string>();
    globalThis.localStorage = {
        getItem: (key) => storage.get(key) ?? null,
        setItem: (key, value) => {
            storage.set(key, value);
        },
        removeItem: (key) => {
            storage.delete(key);
        },
        clear: () => {
            storage.clear();
        },
        key: (index) => [...storage.keys()][index] ?? null,
        get length() {
            return storage.size;
        },
    } as Storage;
}