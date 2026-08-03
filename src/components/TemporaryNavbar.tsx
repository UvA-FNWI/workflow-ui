import {useEffect, useState} from "react";

import {isEmbeddedInCanvas} from "@uva-fnwi/datanose-core";
import {useAuth} from "@uva-fnwi/datanose-core";
import {Button, Heading, Select, SelectItem, useToast} from "@uva-fnwi/datanose-ui";

import {VITE_ENV, VITE_WEBAPI_URL} from "../helpers/Environment";
import {UserPickerModal} from "~/components/UserPicker/UserPickerModal";
import {VersionedLink} from "~/components/VersionedLink";
import {VersionPicker} from "~/components/VersionPicker";
import {useTranslate} from "~/hooks/useTranslate";
import type {UserSearchResult} from "~/store/api/types/users";
import {useStartImpersonationMutation} from "~/store/api/usersApi";
import {
    clearUserImpersonation,
    selectCurrentUser,
    selectUserImpersonation,
    setUserImpersonation,
} from "~/store/authSlice";
import {triggerApiError} from "~/store/errorSlice";
import {useAppDispatch, useAppSelector} from "~/store/store";

type Language = "en" | "nl";

// Temporary navbar for quick language switching and admin tooling during development.
function TemporaryNavbar() {
    const {i18n, t} = useTranslate("common");
    const {isAuthenticated, surfLogout} = useAuth();
    const dispatch = useAppDispatch();
    const toast = useToast();
    const user = useAppSelector(selectCurrentUser);
    // The Develop page and version switching are developer/admin functionality, locked behind
    // super-admin rights (see /Users/Me isSuperAdmin).
    const isSuperAdmin = user?.isSuperAdmin ?? false;

    // While impersonating, the stop control is gated on the token, not isSuperAdmin (which now
    // reflects the target, not the admin).
    const userImpersonation = useAppSelector(selectUserImpersonation);
    const isImpersonating = !!userImpersonation;
    const [isPickerOpen, setIsPickerOpen] = useState(false);
    const [startImpersonation] = useStartImpersonationMutation();

    const handleImpersonate = async (users: UserSearchResult[]) => {
        const target = users[0];
        if (!target) return;
        try {
            const result = await startImpersonation({userName: target.userName}).unwrap();
            dispatch(
                setUserImpersonation({
                    token: result.token,
                    expiresAtUtc: result.expiresAtUtc,
                    targetUserName: target.userName,
                    targetDisplayName: target.displayName,
                    // Captured before the reload swaps currentUser over to the target.
                    adminDisplayName: user?.displayName ?? "",
                }),
            );
            // Reload so every query refetches as the impersonated user.
            window.location.reload();
        } catch (error) {
            const fetchError = error as {
                status?: number;
                data?: {errorCode?: string; message?: string};
            };
            // The target hasn't logged in to Milestones yet, so there's no account to impersonate.
            if (fetchError.data?.errorCode === "ImpersonationTargetNotFound") {
                toast.error(t("impersonate_target_not_found"));
                return;
            }
            dispatch(
                triggerApiError({
                    type: "error",
                    code:
                        typeof fetchError.status === "number" ? fetchError.status : "CUSTOM_ERROR",
                    message: fetchError.data?.message,
                }),
            );
        }
    };

    const handleStopImpersonation = () => {
        dispatch(clearUserImpersonation());
        window.location.reload();
    };

    useEffect(() => {
        document.documentElement.setAttribute("lang", i18n.language);
    }, [i18n.language]);

    if (isEmbeddedInCanvas()) {
        return null;
    }

    return (
        <nav className="sticky top-0 z-10 flex flex-wrap items-center justify-between gap-6 border-b border-grey-300 bg-white/90 px-6 py-4 text-grey-900 shadow-sm backdrop-blur dark:border-grey-800 dark:bg-grey-900/90 dark:text-grey-100">
            <div>
                <Heading size="sm">Milestones (pilot)</Heading>
                {VITE_ENV !== "production" && (
                    <p className="text-xs text-grey-700 dark:text-grey-300">
                        {VITE_ENV} | {VITE_WEBAPI_URL}
                    </p>
                )}
            </div>
            <div className="flex min-w-0 flex-wrap items-center gap-4">
                {userImpersonation && (
                    <div className="flex items-center gap-3 rounded-md bg-amber-100 px-3 py-1.5 text-sm font-medium text-amber-900 dark:bg-amber-900/40 dark:text-amber-100">
                        <span>
                            {t("impersonating_as", {name: userImpersonation.targetDisplayName})}
                        </span>
                        <Button intent="secondary" onClick={handleStopImpersonation} type="button">
                            {t("stop_impersonation")}
                        </Button>
                    </div>
                )}
                {isSuperAdmin && !isImpersonating && (
                    <Button intent="secondary" onClick={() => setIsPickerOpen(true)} type="button">
                        {t("impersonate")}
                    </Button>
                )}
                {isSuperAdmin && (
                    <>
                        <VersionedLink to="/develop" className="text-sm font-medium underline">
                            {t("develop")}
                        </VersionedLink>
                        <VersionPicker />
                    </>
                )}
                <label className="flex items-center gap-2 text-sm font-medium text-grey-700 dark:text-grey-200">
                    {t("language")}
                    <div className="w-32">
                        <Select
                            aria-label={t("language")}
                            selectedKey={i18n.language}
                            onChange={(key) => i18n.changeLanguage(String(key) as Language)}
                        >
                            <SelectItem key="en">{t("language_en")}</SelectItem>
                            <SelectItem key="nl">{t("language_nl")}</SelectItem>
                        </Select>
                    </div>
                </label>
                {isAuthenticated && (
                    <Button
                        intent="primary"
                        variant="destructive"
                        onClick={() => void surfLogout()}
                        type="button"
                        className="max-w-full min-w-0"
                    >
                        {t("logout")} ({userImpersonation?.adminDisplayName ?? user?.displayName})
                    </Button>
                )}
            </div>
            {isSuperAdmin && !isImpersonating && (
                <UserPickerModal
                    isOpen={isPickerOpen}
                    onOpenChange={setIsPickerOpen}
                    selectionMode="single"
                    title={t("impersonate_modal_title")}
                    onConfirm={(users) => void handleImpersonate(users)}
                />
            )}
        </nav>
    );
}

export default TemporaryNavbar;
