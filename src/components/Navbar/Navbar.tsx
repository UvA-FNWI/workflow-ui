import {useEffect, useState} from "react";

import {isEmbeddedInCanvas, useAuth} from "@uva-fnwi/datanose-core";
import {Button, Heading, useToast} from "@uva-fnwi/datanose-ui";

import {NavbarUser} from "~/components/Navbar/NavbarUser";
import {UserPickerModal} from "~/components/UserPicker/UserPickerModal";
import {VersionedLink} from "~/components/VersionedLink";
import {VITE_ENV, VITE_WEBAPI_URL} from "~/helpers/Environment";
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

function Navbar() {
    const {i18n, t} = useTranslate("common");
    const {isAuthenticated, surfLogout} = useAuth();
    const swaggerUrl = `${VITE_WEBAPI_URL.replace(/\/$/, "")}/swagger`;
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
                <VersionedLink to="/" className="no-underline">
                    <Heading size="sm">Milestones (pilot)</Heading>
                </VersionedLink>
                {VITE_ENV !== "production" && (
                    <p className="text-xs text-grey-700 dark:text-grey-300">
                        {VITE_ENV} |{" "}
                        <a href={swaggerUrl} target="_blank" rel="noreferrer" className="underline">
                            {VITE_WEBAPI_URL}
                        </a>
                    </p>
                )}
            </div>
            <div className="flex flex-wrap items-center justify-end gap-x-4 gap-y-2">
                {isAuthenticated && (
                    <VersionedLink to="/personal" className="text-sm font-medium underline">
                        {t("personal_page")}
                    </VersionedLink>
                )}
                {isSuperAdmin && (
                    <VersionedLink to="/develop">
                        <Button intent="primary">{t("develop")}</Button>
                    </VersionedLink>
                )}
                {isAuthenticated && user && (
                    <NavbarUser
                        displayName={userImpersonation?.targetDisplayName ?? user.displayName}
                        showVersionPicker={isSuperAdmin}
                        onStartImpersonation={
                            isSuperAdmin && !isImpersonating
                                ? () => setIsPickerOpen(true)
                                : undefined
                        }
                        onStopImpersonation={isImpersonating ? handleStopImpersonation : undefined}
                        onLogout={surfLogout}
                    />
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

export default Navbar;
