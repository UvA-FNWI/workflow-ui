import {type RefObject, useState} from "react";

import type {FetchBaseQueryError} from "@reduxjs/toolkit/query";
import {Button, Modal, TextArea, useToast} from "@uva-fnwi/datanose-ui";

import {getStepHierarchy} from "~/components/instance/resolveContentState";
import {useTranslate} from "~/hooks/useTranslate";
import {instancesApi, instancesEndpoints} from "~/store/api/instancesApi";
import type {UndoCandidate, WorkflowStep} from "~/store/api/types/instances";
import {useAppDispatch} from "~/store/store";
import {formatDate} from "~/utils/formatDate";

type Props = {
    candidate: UndoCandidate;
    instanceId: string;
    returnFocusRef: RefObject<HTMLElement | null>;
    topLevelStep: WorkflowStep;
};

const isStaleCandidate = (error: unknown) =>
    ((error as FetchBaseQueryError | undefined)?.data as {errorCode?: string} | undefined)
        ?.errorCode === "UndoCandidateChanged";

export function UndoControl({candidate, instanceId, returnFocusRef, topLevelStep}: Props) {
    const {t, l, i18n} = useTranslate("workflow");
    const dispatch = useAppDispatch();
    const toast = useToast();
    const [isOpen, setIsOpen] = useState(false);
    const [reason, setReason] = useState("");
    const [undo, {isLoading}] = instancesEndpoints.undo.useMutation();

    const normalizedReason = reason.trim();
    const owningStep = getStepHierarchy(topLevelStep).find(({id}) => id === candidate.step);
    const owningStepTitle = l(owningStep?.title) ?? candidate.step;
    const operation =
        candidate.type === "FormSubmission"
            ? {type: t("undo.form_submission"), sourceLabel: t("undo.form")}
            : {type: t("undo.execute_action"), sourceLabel: t("undo.action")};

    const close = () => {
        setIsOpen(false);
        setReason("");
    };

    const restoreFocus = () => window.setTimeout(() => returnFocusRef.current?.focus());

    const confirm = async () => {
        if (!normalizedReason || normalizedReason.length > 1000) return;

        try {
            const refreshedInstance = await undo({
                instanceId,
                operationId: candidate.operationId,
                reason: normalizedReason,
            }).unwrap();
            close();
            dispatch(
                instancesApi.util.updateQueryData(
                    "getInstance",
                    instanceId,
                    () => refreshedInstance,
                ),
            );
            restoreFocus();
        } catch (error) {
            if (isStaleCandidate(error)) {
                close();
                dispatch(instancesApi.util.invalidateTags([{type: "Instance", id: instanceId}]));
                toast.warning(t("undo.candidate_changed"));
                restoreFocus();
            } else {
                toast.error(t("undo.error"));
            }
        }
    };

    return (
        <>
            <Button
                intent="ghost"
                variant="destructive"
                size="small"
                aria-label={t("undo.open", {step: owningStepTitle})}
                onClick={() => setIsOpen(true)}
            >
                {t("undo.confirm")}
            </Button>
            <Modal
                isOpen={isOpen}
                onOpenChange={(open) => !open && close()}
                aria-label={t("undo.title")}
            >
                <Modal.Header>{t("undo.title")}</Modal.Header>
                <Modal.Body>
                    <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-2">
                        <dt className="font-semibold">{t("undo.step")}</dt>
                        <dd>
                            <span>{owningStepTitle}</span>
                            {owningStepTitle !== candidate.step && (
                                <span className="ml-1">({candidate.step})</span>
                            )}
                        </dd>
                        <dt className="font-semibold">{t("undo.operation_type")}</dt>
                        <dd>{operation.type}</dd>
                        <dt className="font-semibold">{operation.sourceLabel}</dt>
                        <dd>{candidate.form}</dd>
                        <dt className="font-semibold">{t("undo.occurred_at")}</dt>
                        <dd>{formatDate(candidate.occurredAt, i18n.language)}</dd>
                    </dl>
                    <TextArea
                        className="mt-4"
                        label={t("undo.reason")}
                        description={t("undo.reason_description")}
                        value={reason}
                        maxLength={1000}
                        onChange={setReason}
                    />
                </Modal.Body>
                <Modal.Footer>
                    <Button
                        intent="primary"
                        variant="destructive"
                        size="large"
                        isLoading={isLoading}
                        disabled={!normalizedReason || normalizedReason.length > 1000}
                        onClick={() => void confirm()}
                    >
                        {t("undo.confirm")}
                    </Button>
                    <Button intent="secondary" variant="destructive" size="large" onClick={close}>
                        {t("cancel")}
                    </Button>
                </Modal.Footer>
            </Modal>
        </>
    );
}
