import {useRef, useState} from "react";

import type {FetchBaseQueryError} from "@reduxjs/toolkit/query";
import {
    Button,
    Callout,
    dateToDateValue,
    Modal,
    Select,
    SelectItem,
    Separator,
    TextArea,
    useToast,
} from "@uva-fnwi/datanose-ui";
import {format, isValid, parseISO} from "date-fns";

import {DatePicker} from "~/components/Datepicker/Datepicker";
import {MarkdownRenderer} from "~/components/MarkdownRenderer";
import {useTranslate} from "~/hooks/useTranslate";
import {instancesApi, instancesEndpoints} from "~/store/api/instancesApi";
import type {PostponableDeadline} from "~/store/api/types/instances";
import {useAppDispatch} from "~/store/store";

type Props = {
    instanceId: string;
    deadlines: PostponableDeadline[];
    studentName: string;
    courseName: string;
};

const escapeMarkdown = (value: string) => value.replace(/[\\`*_[\]<>&]/g, "\\$&");

export function PostponeDeadlinesControl({instanceId, deadlines, studentName, courseName}: Props) {
    const {t, l, i18n} = useTranslate("workflow");
    const toast = useToast();
    const dispatch = useAppDispatch();
    const triggerRef = useRef<HTMLButtonElement>(null);
    const [isOpen, setIsOpen] = useState(false);
    const [dates, setDates] = useState<Record<string, Date | null>>({});
    const [reasonType, setReasonType] = useState<string | null>(null);
    const [reason, setReason] = useState("");
    const [postpone, {isLoading}] = instancesEndpoints.postponeDeadlines.useMutation();

    const reasons = [
        {name: "HealthAndWellbeing", text: t("postpone.reasons.HealthAndWellbeing")},
        {name: "AcademicProblems", text: t("postpone.reasons.AcademicProblems")},
        {
            name: "SupervisionAndCollaboration",
            text: t("postpone.reasons.SupervisionAndCollaboration"),
        },
        {name: "OrganizationalFactors", text: t("postpone.reasons.OrganizationalFactors")},
        {name: "ChangedDirection", text: t("postpone.reasons.ChangedDirection")},
        {name: "ExternalFactors", text: t("postpone.reasons.ExternalFactors")},
        {name: "LeavingStudies", text: t("postpone.reasons.LeavingStudies")},
        {name: "PersonalCircumstances", text: t("postpone.reasons.PersonalCircumstances")},
        {name: "ExaminationBoardDecision", text: t("postpone.reasons.ExaminationBoardDecision")},
        {name: "Other", text: t("postpone.reasons.Other")},
    ];

    const selected = deadlines.filter((deadline) => dates[deadline.property] != null);
    const hasInvalidDate = selected.some((deadline) => {
        const date = dates[deadline.property]!;
        return !isValid(date) || format(date, "yyyy-MM-dd") <= deadline.date;
    });
    const normalizedReason =
        reasonType === "Other"
            ? reason.trim()
            : (reasons.find((reason) => reason.name === reasonType)?.text ?? "");
    const canConfirm =
        selected.length > 0 &&
        !hasInvalidDate &&
        normalizedReason.length > 0 &&
        normalizedReason.length <= 1000;

    const close = () => {
        setIsOpen(false);
        setDates({});
        setReasonType(null);
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
            <Button
                ref={triggerRef}
                intent="secondary"
                variant="destructive"
                onClick={() => setIsOpen(true)}
            >
                {t("postpone.title")}
            </Button>
            <Modal
                isOpen={isOpen}
                onOpenChange={(open) => !open && !isLoading && close()}
                aria-label={t("postpone.title")}
            >
                <Modal.Header>{t("postpone.title")}</Modal.Header>
                <Modal.Body>
                    <MarkdownRenderer className="mb-4">
                        {t("postpone.description", {
                            student: escapeMarkdown(studentName),
                            course: escapeMarkdown(courseName),
                        })}
                    </MarkdownRenderer>
                    <Separator className="mb-4" />
                    <div className="flex flex-col gap-4">
                        {deadlines.map((deadline) => {
                            const date = dates[deadline.property] ?? null;
                            const invalid =
                                date != null &&
                                (!isValid(date) || format(date, "yyyy-MM-dd") <= deadline.date);
                            return (
                                <>
                                    <DatePicker
                                        key={deadline.property}
                                        label={l(deadline.title) || deadline.property}
                                        description={t("postpone.current_date", {
                                            date: parseISO(deadline.date).toLocaleDateString(
                                                i18n.language === "en" ? "en-GB" : i18n.language,
                                            ),
                                        })}
                                        value={date}
                                        minValue={
                                            dateToDateValue(parseISO(deadline.date)) ?? undefined
                                        }
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
                                </>
                            );
                        })}
                        <Separator className="mt-2" />
                        <Callout type="info" header={t("postpone.examination_board_title")}>
                            {t("postpone.examination_board_body")}
                        </Callout>
                        <Select
                            name="PostponementReason"
                            label={t("postpone.reason")}
                            placeholder={t("select")}
                            isRequired
                            value={reasonType}
                            onChange={(value) => {
                                setReasonType(value != null ? String(value) : null);
                                setReason("");
                            }}
                            isDisabled={isLoading}
                        >
                            {reasons.map((reason) => (
                                <SelectItem key={reason.name}>{reason.text}</SelectItem>
                            ))}
                        </Select>
                        {reasonType === "Other" && (
                            <TextArea
                                label={t("postpone.explanation")}
                                required
                                description={t("postpone.reason_description")}
                                value={reason}
                                maxLength={1000}
                                onChange={setReason}
                                isDisabled={isLoading}
                            />
                        )}
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
