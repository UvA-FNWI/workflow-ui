import {useEffect} from "react";

import {useNavigate} from "react-router";

import {Confetti, type ToasterType, useToast} from "@datanose/ui";

import {useTranslate} from "~/hooks/useTranslate";
import type {ToastType} from "~/store/api/types/submissions";
import {
    clearRedirectUrl,
    clearShowToast,
    selectRedirectUrl,
    selectShowConfetti,
    selectShowToast,
    setShowConfetti,
} from "~/store/effectsSlice";
import {useAppDispatch, useAppSelector} from "~/store/store";

const toastTypeMap: Record<ToastType, ToasterType> = {
    Error: "error",
    Info: "info",
    Note: "note",
    Success: "success",
    Warning: "warning",
};

function EffectsWrapper() {
    const dispatch = useAppDispatch();
    const navigate = useNavigate();
    const redirectUrl = useAppSelector(selectRedirectUrl);
    const showConfetti = useAppSelector(selectShowConfetti);
    const showToast = useAppSelector(selectShowToast);
    const toast = useToast();
    const {l} = useTranslate();

    useEffect(() => {
        if (!redirectUrl) {
            return;
        }

        navigate(redirectUrl);
        dispatch(clearRedirectUrl());
    }, [dispatch, navigate, redirectUrl]);

    useEffect(() => {
        if (!showToast) {
            return;
        }

        const type = toastTypeMap[showToast.type] ?? "info";
        toast[type](l(showToast.message) ?? "");
        dispatch(clearShowToast());
    }, [dispatch, l, showToast, toast]);

    return (
        <Confetti isActive={!!showConfetti} onComplete={() => dispatch(setShowConfetti(false))} />
    );
}

export default EffectsWrapper;
