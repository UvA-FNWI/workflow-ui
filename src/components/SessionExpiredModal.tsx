import {useEffect} from "react";

import {useAuth} from "@uva-fnwi/datanose-core";
import {Button, Modal} from "@uva-fnwi/datanose-ui";

import {useTranslate} from "~/hooks/useTranslate";
import {openSessionExpiredModal, selectShowSessionExpiredModal} from "~/store/authSlice";
import {useAppDispatch, useAppSelector} from "~/store/store";

const ACCESS_TOKEN_EXPIRING_WARNING_MS = 60_000;

function SessionExpiredModal() {
    const dispatch = useAppDispatch();
    const showSessionExpiredModal = useAppSelector(selectShowSessionExpiredModal);
    const {t} = useTranslate("common");
    const {isAuthenticated, providerType, surfRenewLogin, user} = useAuth();

    useEffect(() => {
        if (!isAuthenticated || providerType !== "canvas" || !user?.expires_at) {
            return;
        }

        const timeoutMs = user.expires_at * 1000 - Date.now() - ACCESS_TOKEN_EXPIRING_WARNING_MS;

        if (timeoutMs <= 0) {
            if (!showSessionExpiredModal) {
                dispatch(openSessionExpiredModal());
            }
            return;
        }

        const timeoutId = window.setTimeout(() => {
            dispatch(openSessionExpiredModal());
        }, timeoutMs);

        return () => {
            window.clearTimeout(timeoutId);
        };
    }, [dispatch, isAuthenticated, providerType, showSessionExpiredModal, user?.expires_at]);

    const isCanvas = providerType === "canvas";
    const handleLogin = () => {
        void surfRenewLogin({
            redirectUrl: `${window.location.pathname}${window.location.search}${window.location.hash}`,
        });
    };

    return (
        <Modal
            isOpen={showSessionExpiredModal && isAuthenticated}
            aria-label={t("session_expired_title")}
            role="alertdialog"
            showCloseButton={false}
            size="sm"
            isDismissable={false}
            isKeyboardDismissDisabled={true}
        >
            <Modal.Header>{t("session_expired_title")}</Modal.Header>
            <Modal.Body>
                <p>{t(isCanvas ? "session_expired_canvas_body" : "session_expired_surf_body")}</p>
            </Modal.Body>
            {!isCanvas && (
                <Modal.Footer>
                    <Button intent="primary" onClick={handleLogin}>
                        {t("login")}
                    </Button>
                </Modal.Footer>
            )}
        </Modal>
    );
}

export default SessionExpiredModal;
