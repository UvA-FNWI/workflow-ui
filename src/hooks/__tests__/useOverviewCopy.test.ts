import {renderHook} from "@testing-library/react";
import {describe, expect, it, vi} from "vitest";

import {useOverviewCopy} from "../useOverviewCopy";

vi.mock("~/hooks/useTranslate", () => ({
    useTranslate: () => ({
        t: (key: string) =>
            ({
                "overview.page_title": "Overview",
                "overview.choose_course_title": "Choose your course",
                "overview.default_no_access": "No access",
            })[key] ?? key,
        l: (value?: {en?: string}) => value?.en ?? "",
    }),
}));

describe("useOverviewCopy", () => {
    it("uses configured overview copy when provided", () => {
        const {result} = renderHook(() =>
            useOverviewCopy({
                pageTitle: {en: "Hub", nl: "Hub"},
                title: {en: "Security registers", nl: "Security registers"},
                subtitle: {en: "Pick one", nl: "Pick one"},
                noAccess: {en: "Nothing here", nl: "Nothing here"},
            }),
        );

        expect(result.current).toEqual({
            pageTitle: "Hub",
            title: "Security registers",
            subtitle: "Pick one",
            noAccess: "Nothing here",
        });
    });

    it("falls back to generic workflow copy when settings are absent", () => {
        const {result} = renderHook(() => useOverviewCopy());

        expect(result.current).toEqual({
            pageTitle: "Overview",
            title: "Choose your course",
            subtitle: undefined,
            noAccess: "No access",
        });
    });

    it("omits subtitle when Settings.yaml has no overview.subtitle", () => {
        const {result} = renderHook(() =>
            useOverviewCopy({
                title: {en: "Courses", nl: "Courses"},
            }),
        );

        expect(result.current.subtitle).toBeUndefined();
        expect(result.current.title).toBe("Courses");
    });
});
