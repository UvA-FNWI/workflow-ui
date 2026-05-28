import {useEffect} from "react";

import {useDispatch, useSelector} from "react-redux";

import {useToast} from "@uva-fnwi/datanose-ui";

import {useTranslate} from "~/hooks/useTranslate.ts";
import {baseApi} from "~/store/api/baseApi.ts";
import {clearEffectError, selectEffectError} from "~/store/effectsSlice.ts";
import {resetApiError, selectApiError} from "~/store/errorSlice.ts";

export const ErrorWrapper = () => {
    const {t, l} = useTranslate("common");
    const dispatch = useDispatch();
    const apiError = useSelector(selectApiError);
    const effectError = useSelector(selectEffectError);
    const toast = useToast();

    const activeError = apiError?.type ? apiError : effectError?.type ? effectError : null;

    const {type, message, instanceId} = activeError ?? {};

    useEffect(() => {
        if (!activeError) return;

        if (type === "warning") {
            toast.warning(
                `${typeof message === "object" ? l(message) : ""}  ${t("errors.contact_message")}`,
                {
                    title: t("errors.warning_title"),
                },
            );
        } else {
            toast.error(
                `${typeof message === "object" ? l(message) : ""}  ${t("errors.contact_message")}`,
                {
                    title: t("errors.error_title"),
                },
            );
        }
        if (instanceId) {
            dispatch(baseApi.util.invalidateTags([{type: "Instance", id: instanceId}]));
        }
        dispatch(resetApiError());
        dispatch(clearEffectError());
    }, [type, dispatch, instanceId, message, t, toast, activeError, l]);

    return null;
};
