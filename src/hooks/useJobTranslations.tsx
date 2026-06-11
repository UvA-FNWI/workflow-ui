import {useCallback, useMemo} from "react";

import {useTranslate} from "./useTranslate";

export const useJobTranslations = () => {
    const {t, i18n} = useTranslate("jobs");

    const page = useMemo(
        () => ({
            backToInstance: t("backToInstance"),
            error: t("error"),
            title: t("title"),
            viewJobs: t("viewJobs"),
        }),
        [t],
    );

    const columns = useMemo(
        () => ({
            source: t("source"),
            status: t("status"),
            startOn: t("startOn"),
            executedOn: t("executedOn"),
            createdBy: t("createdBy"),
            message: t("message"),
        }),
        [t],
    );

    const properties = useMemo(
        () => ({
            id: t("id"),
            status: t("status"),
            sourceType: t("sourceType"),
            sourceName: t("sourceName"),
            startOn: t("startOn"),
            executedOn: t("executedOn"),
            createdBy: t("createdBy"),
            isSynchronous: t("isSynchronous"),
            workerGroup: t("workerGroup"),
            claimedUntil: t("claimedUntil"),
            instanceId: t("instanceId"),
            message: t("message"),
        }),
        [t],
    );

    const modal = useMemo(
        () => ({
            title: t("modal.title"),
            error: t("modal.error"),
            run: t("modal.run"),
            confirmRunMessage: t("modal.confirmRunMessage"),
            yes: t("modal.yes"),
            no: t("modal.no"),
            noSteps: t("modal.noSteps"),
            step: t("modal.step"),
            steps: t("modal.steps"),
            stepMessage: t("modal.stepMessage"),
            stepOutputs: t("modal.stepOutputs"),
        }),
        [t],
    );

    const stepNumber = useCallback((number: number) => t("modal.stepNumber", {number}), [t]);

    return {page, columns, properties, modal, stepNumber, i18n};
};
