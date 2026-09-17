import {useState} from "react";

import {Button, Callout, Modal, Radio, RadioGroup, Text} from "@uva-fnwi/datanose-ui";

import {PostponeAllDeadlines} from "./PostponeAllDeadlines";
import {deadlineDate, postponeByDays} from "./postponeDeadline";
import {PostponeDeadlineReason} from "./PostponeDeadlineReason";
import {PostponeIndividualDeadlines} from "./PostponeIndividualDeadlines";
import {useTranslate} from "~/hooks/useTranslate";
import {deadlinesApi} from "~/store/api/deadlinesApi";
import type {
    DeadlineChange,
    ExtendableDeadline,
    PostponementError,
} from "~/store/api/types/deadlines";
import type {Form} from "~/store/api/types/submissions";

type Props = {
    onClose: () => void;
    instanceId: string;
    actionName: string;
    form: Form;
    deadlines: ExtendableDeadline[];
};

export function PostponeDeadlineModal({onClose, instanceId, actionName, form, deadlines}: Props) {
    const {t, l} = useTranslate("workflow");
    const [mode, setMode] = useState("");
    const [amount, setAmount] = useState("");
    const [unit, setUnit] = useState("days");
    const [dates, setDates] = useState<Record<string, string>>({});
    const [reason, setReason] = useState({choice: "", explanation: ""});
    const questions = form.pages.flatMap((page) => page.questions);
    const reasonQuestion = questions.find((question) => question.name === "PostponementReason");
    const explanationQuestion = questions.find(
        (question) => question.name === "PostponementExplanation",
    );
    const reasons = reasonQuestion?.choices ?? [];
    const [postpone, {isLoading, error}] = deadlinesApi.endpoints.postponeDeadlines.useMutation();

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
        if (changes.some((change) => change.newDate <= deadlineDate(change.previousDate)))
            changes = [];
    }

    const submit = async () => {
        const choice = reasons.find((choice) => choice.name === reason.choice);
        let description = l(choice?.text) || reason.choice;
        if (reason.choice === "Other") description += "\n" + reason.explanation.trim();

        const result = await postpone({
            instanceId,
            actionName,
            request: {
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
    const errorMessage = Array.isArray(errors)
        ? errors
              .map((code) =>
                  t(`postponement.errors.${code}`, {defaultValue: t("postponement.save_error")}),
              )
              .join("\n")
        : t("postponement.save_error");

    return (
        <Modal isOpen onOpenChange={onClose}>
            <Modal.Header className="pb-0">{l(form.title)}</Modal.Header>
            <div className="px-6">
                <Text>{t("postponement.introduction")}</Text>
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
