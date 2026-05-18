import {useEffect} from "react";

import {useNavigate} from "react-router";

import {Confetti, useToast} from "@uva-fnwi/datanose-ui";

import {ErrorModal} from "~/components/ErrorModal.tsx";
import {useTranslate} from "~/hooks/useTranslate";
import {
    clearRedirectUrl,
    clearToast,
    selectRedirectUrl,
    selectShowConfetti,
    selectToast,
    setShowConfetti,
} from "~/store/effectsSlice";
import {useAppDispatch, useAppSelector} from "~/store/store";

const toastTypeMap = {
    Error: "error",
    Info: "info",
    Note: "note",
    Success: "success",
    Warning: "warning",
} as const;

function EffectsWrapper() {
    const dispatch = useAppDispatch();
    const navigate = useNavigate();
    const redirectUrl = useAppSelector(selectRedirectUrl);
    const showConfetti = useAppSelector(selectShowConfetti);
    const workflowToast = useAppSelector(selectToast);
    const toast = useToast();
    const {l} = useTranslate();

    useEffect(() => {
        if (!redirectUrl) {
            return;
        }

        const url = new URL(redirectUrl, window.location.href);

        if (url.origin === window.location.origin) {
            navigate(`${url.pathname}${url.search}${url.hash}`);
        } else {
            window.location.assign(redirectUrl);
        }

        dispatch(clearRedirectUrl());
    }, [dispatch, navigate, redirectUrl]);

    useEffect(() => {
        if (!workflowToast) {
            return;
        }

        const type = toastTypeMap[workflowToast.type] ?? "info";
        toast.custom(type, l(workflowToast.message) ?? "");
        dispatch(clearToast());
    }, [dispatch, l, toast, workflowToast]);

    return (
        <>
            <Confetti
                isActive={!!showConfetti}
                onComplete={() => dispatch(setShowConfetti(false))}
            />
            <ErrorModal />
        </>
    );
}

export default EffectsWrapper;
