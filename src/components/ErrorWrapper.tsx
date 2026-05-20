import {useEffect} from "react";

import {useTranslation} from "react-i18next";
import {useDispatch, useSelector} from "react-redux";

import {useToast} from "@uva-fnwi/datanose-ui";

import {resetApiError, selectApiErrorCode} from "~/store/errorSlice.ts";

export const ErrorWrapper = () => {
    const {t} = useTranslation("common");
    const dispatch = useDispatch();
    const code = useSelector(selectApiErrorCode);
    const toast = useToast();

    useEffect(() => {
        if (code === 0) return;

        toast.error(t("error_modal.message"), {
            title: t("error_modal.title"),
        });

        dispatch(resetApiError());
    }, [code, dispatch, t, toast]);

    return null;
};
