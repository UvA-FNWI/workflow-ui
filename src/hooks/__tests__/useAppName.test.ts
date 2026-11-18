import {renderHook} from "@testing-library/react";
import {describe, expect, it, vi} from "vitest";

import {useAppName} from "../useAppName";

const {getSettings} = vi.hoisted(() => ({
    getSettings: vi.fn(),
}));

vi.mock("~/store/api/settingsApi", () => ({
    useGetSettingsQuery: () => getSettings(),
}));

vi.mock("~/helpers/Environment", () => ({
    VITE_APP_NAME: "Env Register",
}));

vi.mock("~/hooks/useTranslate", () => ({
    useTranslate: () => ({
        t: (key: string) => (key === "app_name" ? "Workflow" : key),
        l: (value?: {en?: string}) => value?.en ?? "",
    }),
}));

describe("useAppName", () => {
    it("prefers settings appName over env and locale fallback", () => {
        getSettings.mockReturnValue({
            data: {ui: {appName: {en: "Security Register", nl: "Security Register"}}},
        });

        const {result} = renderHook(() => useAppName());

        expect(result.current).toBe("Security Register");
    });

    it("falls back to VITE_APP_NAME when settings are absent", () => {
        getSettings.mockReturnValue({data: undefined});

        const {result} = renderHook(() => useAppName());

        expect(result.current).toBe("Env Register");
    });
});
