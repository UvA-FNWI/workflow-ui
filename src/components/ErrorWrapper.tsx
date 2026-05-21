import {useEffect} from "react";

import {useTranslation} from "react-i18next";
import {useDispatch, useSelector} from "react-redux";

import {useToast} from "@uva-fnwi/datanose-ui";

import {baseApi} from "~/store/api/baseApi.ts";
import {resetApiError, selectApiError} from "~/store/errorSlice.ts";

export const ErrorWrapper = () => {
    const {t} = useTranslation("common");
    const dispatch = useDispatch();
    const {code, message, instanceId} = useSelector(selectApiError);
    const toast = useToast();

    useEffect(() => {
        if (code === 0) return;

        if (code === 500 && message === "Job failed") {
            toast.warning(t("errors.warning_message"), {
                title: t("errors.warning_title"),
            });
        } else if (code === 500) {
            toast.error(t("errors.error_message"), {
                title: t("errors.error_title"),
            });
        }
        if (instanceId) {
            dispatch(baseApi.util.invalidateTags([{type: "Instance", id: instanceId}]));
        }
        dispatch(resetApiError());
    }, [code, dispatch, instanceId, message, t, toast]);

    return null;
};
