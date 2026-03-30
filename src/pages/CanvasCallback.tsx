import {useEffect} from "react";

import {useLocation, useNavigate} from "react-router";

import {
    getCanvasTokenFromLocalStorage,
    isEmbeddedInCanvas,
    setCanvasTokenInLocalStorage,
    useAuth,
} from "@uva-fnwi/datanose-core";

import i18n from "../i18n";
import {setAccessToken} from "../store/authSlice";
import {useAppDispatch} from "../store/store";

function CanvasCallback() {
    const {canvasCompleteLogin} = useAuth();
    const dispatch = useAppDispatch();
    const location = useLocation();
    const navigate = useNavigate();
    const embeddedInCanvas = isEmbeddedInCanvas();
    const token = location.hash ? location.hash.slice(1) : getCanvasTokenFromLocalStorage();
    const errorCode = new URLSearchParams(location.search).get("error");

    useEffect(() => {
        if (!token) {
            if (embeddedInCanvas) {
                return;
            }

            navigate("/", {replace: true});
            return;
        }

        try {
            const {target, locale} = canvasCompleteLogin(token);
            setCanvasTokenInLocalStorage(token);
            dispatch(setAccessToken(token));

            const language = locale?.split("-")[0];
            if (language === "en" || language === "nl") {
                void i18n.changeLanguage(language);
            }

            navigate(target || "/", {replace: true});
        } catch {
            if (embeddedInCanvas) {
                localStorage.removeItem("canvas-token");
                navigate("/canvas?error=login", {replace: true});
                return;
            }

            navigate("/", {replace: true});
        }
    }, [canvasCompleteLogin, dispatch, embeddedInCanvas, navigate, token]);

    if ((embeddedInCanvas && !token) || errorCode === "login") {
        return <div>Unable to complete Canvas login.</div>;
    }

    return null;
}

export default CanvasCallback;
