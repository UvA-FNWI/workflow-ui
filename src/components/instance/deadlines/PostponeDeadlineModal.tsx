import {useEffect, useState} from "react";

import {
    Button,
    Callout,
    LoadingSpinner,
    Modal,
    Radio,
    RadioGroup,
    Text,
} from "@uva-fnwi/datanose-ui";

import {PostponeAllDeadlines} from "./PostponeAllDeadlines";
import {deadlineDate, postponeByDays, remainingPostponementDays} from "./postponeDeadline";
import {PostponeDeadlineReason} from "./PostponeDeadlineReason";
import {PostponeIndividualDeadlines} from "./PostponeIndividualDeadlines";
import {MarkdownRenderer} from "~/components/MarkdownRenderer";
import {type LocalString, useTranslate} from "~/hooks/useTranslate";
import {actionsApi} from "~/store/api/actionsApi";
import type {
    DeadlineChange,
    ExtendableDeadline,
    PostponementError,
} from "~/store/api/types/deadlines";

type Props = {
    onClose: () => void;
    instanceId: string;
    actionName: string;
    title: LocalString;
    onLoadingChange?: (loading: boolean) => void;
    deadlines: ExtendableDeadline[];
};

export function PostponeDeadlineModal({
    onClose,
    instanceId,
    actionName,
    title,
    onLoadingChange,
    deadlines,
}: Props) {
    const {t, l} = useTranslate("workflow");
    const {
        currentData: form,
        isFetching,
        isError,
        refetch,
    } = actionsApi.endpoints.getActionForm.useQuery(
        {instanceId, actionName},
        {refetchOnMountOrArgChange: true},
    );
    useEffect(() => onLoadingChange?.(isFetching), [isFetching, onLoadingChange]);
    const [mode, setMode] = useState("");
    const [amount, setAmount] = useState("");
    const [unit, setUnit] = useState("days");
    const [dates, setDates] = useState<Record<string, string>>({});
    const [reason, setReason] = useState({choice: "", explanation: ""});
    const questions = form?.pages.flatMap((page) => page.questions) ?? [];
    const reasonQuestion = questions.find((question) => question.name === "PostponementReason");
    const explanationQuestion = questions.find(
        (question) => question.name === "PostponementExplanation",
    );
    const reasons = reasonQuestion?.choices ?? [];
    const [executeAction, {isLoading, error}] = actionsApi.endpoints.executeAction.useMutation();

    const maximumDays = remainingPostponementDays(deadlines);
    // Recheck authorization on every opening before showing cached metadata.
    if (!form || isFetching || isError) {
        return (
            <Modal isOpen onOpenChange={onClose} aria-label={l(title)}>
                <Modal.Header>{l(title)}</Modal.Header>
                <Modal.Body>
                    {isError && !isFetching ? (
                        <Callout type="error">{t("form_loading.error")}</Callout>
                    ) : (
                        <div role="status" aria-label={t("form_loading.loading")}>
                            <LoadingSpinner />
                        </div>
                    )}
                </Modal.Body>
                <Modal.Footer>
                    {isError && !isFetching && (
                        <Button intent="primary" onClick={() => void refetch()}>
                            {t("form_loading.retry")}
                        </Button>
                    )}
                    <Button intent="secondary" onClick={onClose}>
                        {t("cancel")}
                    </Button>
                </Modal.Footer>
            </Modal>
        );
    }

    let changes: DeadlineChange[] = [];
    if (mode === "all") {
        changes = postponeByDays(deadlines, Number(amount) * (unit === "weeks" ? 7 : 1));
    } else if (mode === "individual") {
        changes = deadlines
            .filter((deadline) => dates[deadline.property])
            .map((deadline) => ({
                property: deadline.property,
                previousDate: deadline.date,
                newDate: dates[deadline.property]!,
            }));
        if (
            changes.some((change) => {
                const maximum = deadlines.find(
                    (deadline) => deadline.property === change.property,
                )?.maxDate;
                return (
                    change.newDate <= deadlineDate(change.previousDate) ||
                    (maximum != null && change.newDate > maximum)
                );
            })
        )
            changes = [];
    }

    const submit = async () => {
        if (!changes.length) return;
        const choice = reasons.find((choice) => choice.name === reason.choice);
        let description = l(choice?.text) || reason.choice;
        if (reason.choice === "Other") description += "\n" + reason.explanation.trim();

        const result = await executeAction({
            type: "PostponeDeadlines",
            instanceId,
            name: actionName,
            input: {
                changes,
                reason: description,
            },
        });
        if (!result.error) onClose();
    };

    const errors =
        error && typeof error === "object" && "data" in error
            ? (error.data as PostponementError[])
            : undefined;
    const errorMessages: Record<PostponementError, string> = {
        InvalidChanges: t("postponement.errors.InvalidChanges"),
        MaximumExtensionExceeded: t("postponement.errors.MaximumExtensionExceeded"),
    };
    const errorMessage = Array.isArray(errors)
        ? errors.map((code) => errorMessages[code] ?? t("postponement.save_error")).join("\n")
        : t("postponement.save_error");

    return (
        <Modal isOpen onOpenChange={onClose} aria-label={l(form.title)}>
            <Modal.Header className="pb-0">{l(form.title)}</Modal.Header>
            <div className="px-6">
                <Text as="span">
                    <MarkdownRenderer>
                        {l(form.pages[0]?.introduction) || t("postponement.introduction")}
                    </MarkdownRenderer>
                </Text>
            </div>
            <Modal.Body>
                {!deadlines.length ? (
                    <Text>{t("postponement.no_deadlines")}</Text>
                ) : (
                    <div className="flex flex-col gap-4 pb-4">
                        <RadioGroup
                            label={t("postponement.scope")}
                            value={mode}
                            onChange={(value) => {
                                setMode(value);
                                setAmount("");
                                setDates({});
                            }}
                        >
                            <Radio value="all">{t("postponement.all")}</Radio>
                            <Radio value="individual">{t("postponement.individual")}</Radio>
                        </RadioGroup>
                        {mode === "all" && (
                            <PostponeAllDeadlines
                                amount={amount}
                                unit={unit}
                                maximumDays={maximumDays}
                                onAmountChange={setAmount}
                                onUnitChange={setUnit}
                            />
                        )}
                        {mode === "individual" && (
                            <PostponeIndividualDeadlines
                                deadlines={deadlines}
                                dates={dates}
                                onDateChange={(property, value) =>
                                    setDates((current) => ({...current, [property]: value}))
                                }
                            />
                        )}
                    </div>
                )}
                {mode && reasonQuestion && explanationQuestion && (
                    <PostponeDeadlineReason
                        reasonQuestion={reasonQuestion}
                        explanationQuestion={explanationQuestion}
                        value={reason}
                        onChange={setReason}
                    />
                )}
                {Boolean(error) && (
                    <Callout type="error" className="mt-4">
                        {errorMessage}
                    </Callout>
                )}
            </Modal.Body>
            <Modal.Footer>
                <Button
                    intent="primary"
                    variant="destructive"
                    size="large"
                    disabled={
                        !changes.length ||
                        !reason.choice ||
                        (reason.choice === "Other" && !reason.explanation.trim())
                    }
                    isLoading={isLoading}
                    onClick={submit}
                >
                    {t("confirm")}
                </Button>
                <Button intent="secondary" variant="destructive" size="large" onClick={onClose}>
                    {t("cancel")}
                </Button>
            </Modal.Footer>
        </Modal>
    );
}
