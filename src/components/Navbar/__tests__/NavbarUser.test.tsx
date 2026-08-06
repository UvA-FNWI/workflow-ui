import {cleanup, fireEvent, render, screen} from "@testing-library/react";
import {afterEach, beforeEach, describe, expect, it, vi} from "vitest";

import {NavbarUser} from "../NavbarUser";
import nlFlag from "~/assets/NL.svg";

const {changeLanguage, getVersionDetails, setWorkflowVersion} = vi.hoisted(() => ({
    changeLanguage: vi.fn(),
    getVersionDetails: vi.fn(),
    setWorkflowVersion: vi.fn(),
}));

vi.mock("~/hooks/useTranslate", () => ({
    useTranslate: () => ({
        i18n: {language: "nl", changeLanguage},
        t: (key: string, options?: {name?: string}) => {
            if (key === "impersonating_as") {
                return `Je doet je voor als ${options?.name}`;
            }
            return (
                {
                    language: "Taal",
                    language_en: "Engels",
                    language_nl: "Nederlands",
                    logout: "Uitloggen",
                    impersonate: "Voordoen als gebruiker",
                    stop_impersonation: "Stoppen met voordoen",
                    user_menu: "Gebruikersmenu",
                    version: "Versie",
                }[key] ?? key
            );
        },
    }),
}));

vi.mock("~/hooks/useVersionedNavigate", () => ({
    setWorkflowVersion,
}));

vi.mock("~/store/api/versionsApi", () => ({
    useGetVersionDetailsQuery: getVersionDetails,
}));

describe("NavbarUser", () => {
    afterEach(cleanup);

    beforeEach(() => {
        changeLanguage.mockClear();
        setWorkflowVersion.mockClear();
        getVersionDetails.mockReturnValue({data: []});
        window.history.replaceState({}, "", "/");
    });

    it("exposes version selection as a submenu", async () => {
        window.history.replaceState({}, "", "/?version=2025");
        getVersionDetails.mockReturnValue({
            data: [
                {
                    name: "2025",
                    commit: "123456789",
                    loadedAt: "2026-08-01T12:00:00Z",
                    kind: "Branch",
                },
                {
                    name: "2026",
                    commit: "987654321",
                    loadedAt: "2026-08-02T12:00:00Z",
                    kind: "Branch",
                },
            ],
        });
        render(<NavbarUser displayName="Ada Lovelace" showVersionPicker onLogout={vi.fn()} />);

        const trigger = screen.getByRole("button", {
            name: "Gebruikersmenu: Ada Lovelace",
        });
        fireEvent.keyDown(trigger, {key: "ArrowDown"});
        const versionItem = await screen.findByRole("menuitem", {name: /^Versie: 2025/});
        versionItem.focus();
        fireEvent.keyDown(versionItem, {key: "ArrowRight"});
        fireEvent.click(await screen.findByRole("menuitemradio", {name: /^2026/}));

        expect(setWorkflowVersion).toHaveBeenCalledWith("2026");
        expect(trigger.getAttribute("aria-expanded")).toBe("false");
    });

    it("shows the user and exposes language and logout actions in a popover", async () => {
        const onLogout = vi.fn();
        render(<NavbarUser displayName="Ada Lovelace" onLogout={onLogout} />);

        const trigger = screen.getByRole("button", {
            name: "Gebruikersmenu: Ada Lovelace",
        });
        expect(trigger.textContent).toContain("A. L.");
        expect(trigger.textContent).toContain("Ada Lovelace");
        expect(trigger.className).toContain("cursor-pointer");

        fireEvent.keyDown(trigger, {key: "ArrowDown"});
        const languageItem = await screen.findByRole("menuitem", {name: /^Taal/});
        expect(languageItem.querySelector("img")?.getAttribute("src")).toBe(nlFlag);
        fireEvent.keyDown(languageItem, {key: "ArrowRight"});
        fireEvent.click(await screen.findByRole("menuitemradio", {name: "Engels"}));
        expect(changeLanguage).toHaveBeenCalledWith("en");
        expect(trigger.getAttribute("aria-expanded")).toBe("true");

        fireEvent.pointerDown(document.body, {button: 0});
        fireEvent.click(document.body, {button: 0});
        expect(trigger.getAttribute("aria-expanded")).toBe("false");

        fireEvent.click(trigger);
        const logoutItem = await screen.findByRole("menuitem", {name: "Uitloggen"});
        expect(logoutItem.className).toContain("cursor-pointer");
        fireEvent.click(logoutItem);
        expect(onLogout).toHaveBeenCalledOnce();
    });

    it("keeps the root menu open when focus moves away from a submenu", async () => {
        render(<NavbarUser displayName="Ada Lovelace" onLogout={vi.fn()} />);

        const trigger = screen.getByRole("button", {
            name: "Gebruikersmenu: Ada Lovelace",
        });
        fireEvent.keyDown(trigger, {key: "ArrowDown"});
        const languageItem = await screen.findByRole("menuitem", {name: /^Taal/});
        fireEvent.keyDown(languageItem, {key: "ArrowRight"});
        await screen.findByRole("menuitemradio", {name: "Engels"});

        screen.getByRole("menuitem", {name: "Uitloggen"}).focus();

        expect(trigger.getAttribute("aria-expanded")).toBe("true");
        expect(screen.queryByRole("menu", {name: "Taal"})).toBeNull();
    });

    it("exposes the start impersonation action when available", async () => {
        const onStartImpersonation = vi.fn();
        render(
            <NavbarUser
                displayName="Ada Lovelace"
                onStartImpersonation={onStartImpersonation}
                onLogout={vi.fn()}
            />,
        );

        fireEvent.keyDown(screen.getByRole("button"), {key: "ArrowDown"});
        const impersonateItem = await screen.findByRole("menuitem", {
            name: "Voordoen als gebruiker",
        });
        expect(impersonateItem.className).toContain("cursor-pointer");
        fireEvent.click(impersonateItem);

        expect(onStartImpersonation).toHaveBeenCalledOnce();
    });

    it("exposes the stop impersonation action when available", async () => {
        const onStopImpersonation = vi.fn();
        render(
            <NavbarUser
                displayName="Grace Hopper"
                onStopImpersonation={onStopImpersonation}
                onLogout={vi.fn()}
            />,
        );

        const trigger = screen.getByRole("button", {name: "Gebruikersmenu: Grace Hopper"});
        expect(trigger.textContent).toContain("Je doet je voor als Grace Hopper");
        expect(trigger.className).toContain("bg-amber-100");
        fireEvent.keyDown(trigger, {key: "ArrowDown"});
        const stopImpersonationItem = await screen.findByRole("menuitem", {
            name: "Stoppen met voordoen",
        });
        fireEvent.click(stopImpersonationItem);

        expect(onStopImpersonation).toHaveBeenCalledOnce();
    });
});
