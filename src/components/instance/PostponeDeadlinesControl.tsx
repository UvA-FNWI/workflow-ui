import {useRef, useState} from "react";

import type {FetchBaseQueryError} from "@reduxjs/toolkit/query";
import {Button, Modal, TextArea, useToast} from "@uva-fnwi/datanose-ui";
import {format, isValid, parseISO} from "date-fns";

import {DatePicker} from "~/components/Datepicker/Datepicker";
import {useTranslate} from "~/hooks/useTranslate";
import {instancesApi, instancesEndpoints} from "~/store/api/instancesApi";
import type {PostponableDeadline} from "~/store/api/types/instances";
import {useAppDispatch} from "~/store/store";

type Props = {instanceId: string; deadlines: PostponableDeadline[]};

export function PostponeDeadlinesControl({instanceId, deadlines}: Props) {
    const {t, l, i18n} = useTranslate("workflow");
    const toast = useToast();
    const dispatch = useAppDispatch();
    const triggerRef = useRef<HTMLButtonElement>(null);
    const [isOpen, setIsOpen] = useState(false);
    const [dates, setDates] = useState<Record<string, Date | null>>({});
    const [reason, setReason] = useState("");
    const [postpone, {isLoading}] = instancesEndpoints.postponeDeadlines.useMutation();

    const selected = deadlines.filter((deadline) => dates[deadline.property] != null);
    const hasInvalidDate = selected.some((deadline) => {
        const date = dates[deadline.property]!;
        return !isValid(date) || format(date, "yyyy-MM-dd") <= deadline.date;
    });
    const normalizedReason = reason.trim();
    const canConfirm =
        selected.length > 0 &&
        !hasInvalidDate &&
        normalizedReason.length > 0 &&
        normalizedReason.length <= 1000;

    const close = () => {
        setIsOpen(false);
        setDates({});
        setReason("");
        window.setTimeout(() => triggerRef.current?.focus());
    };

    const confirm = async () => {
        if (!canConfirm || isLoading) return;
        try {
            await postpone({
                instanceId,
                reason: normalizedReason,
                changes: selected.map((deadline) => ({
                    property: deadline.property,
                    currentDate: deadline.date,
                    date: format(dates[deadline.property]!, "yyyy-MM-dd"),
                })),
            }).unwrap();
            close();
            toast.success(t("postpone.success"));
        } catch (error) {
            const code = ((error as FetchBaseQueryError).data as {errorCode?: string})?.errorCode;
            if (code === "DeadlineChanged" || code === "InvalidDeadlineProperty") {
                dispatch(instancesApi.util.invalidateTags([{type: "Instance", id: instanceId}]));
                close();
                toast.warning(t("postpone.deadline_changed"));
            } else {
                toast.error(
                    t(code === "InvalidDeadlineDate" ? "postpone.invalid_date" : "postpone.error"),
                );
            }
        }
    };

    if (deadlines.length === 0) return null;

    return (
        <>
            <Button ref={triggerRef} intent="secondary" onClick={() => setIsOpen(true)}>
                {t("postpone.title")}
            </Button>
            <Modal
                isOpen={isOpen}
                onOpenChange={(open) => !open && !isLoading && close()}
                aria-label={t("postpone.title")}
            >
                <Modal.Header>{t("postpone.title")}</Modal.Header>
                <Modal.Body>
                    <p className="mb-4">{t("postpone.description")}</p>
                    <div className="flex flex-col gap-4">
                        {deadlines.map((deadline) => {
                            const date = dates[deadline.property] ?? null;
                            const invalid =
                                date != null &&
                                (!isValid(date) || format(date, "yyyy-MM-dd") <= deadline.date);
                            return (
                                <DatePicker
                                    key={deadline.property}
                                    label={l(deadline.title) || deadline.property}
                                    description={t("postpone.current_date", {
                                        date: parseISO(deadline.date).toLocaleDateString(
                                            i18n.language === "en" ? "en-GB" : i18n.language,
                                        ),
                                    })}
                                    value={date}
                                    onChange={(date) =>
                                        setDates((previous) => ({
                                            ...previous,
                                            [deadline.property]: date,
                                        }))
                                    }
                                    isDisabled={isLoading}
                                    isValid={!invalid}
                                    errorMessage={t("postpone.later_date")}
                                />
                            );
                        })}
                        <TextArea
                            label={t("postpone.reason")}
                            required
                            description={t("postpone.reason_description")}
                            value={reason}
                            maxLength={1000}
                            onChange={setReason}
                            isDisabled={isLoading}
                        />
                    </div>
                </Modal.Body>
                <Modal.Footer>
                    <Button
                        intent="primary"
                        isLoading={isLoading}
                        disabled={!canConfirm || isLoading}
                        onClick={() => void confirm()}
                    >
                        {t("postpone.confirm")}
                    </Button>
                    <Button intent="secondary" disabled={isLoading} onClick={close}>
                        {t("cancel")}
                    </Button>
                </Modal.Footer>
            </Modal>
        </>
    );
}
