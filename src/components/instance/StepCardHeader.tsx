import {Heading, Pill, type PillVariantProps, Text} from "@uva-fnwi/datanose-ui";

import {getStepHierarchy} from "~/components/instance/resolveContentState.ts";
import {useTranslate} from "~/hooks/useTranslate.ts";
import type {StepHeaderStatus, WorkflowStep} from "~/store/api/types/instances.ts";
import {formatDateShort, formatDateShortWithRelevantTime} from "~/utils/formatDate.ts";

const HEADER_STATUS_VARIANT: Record<StepHeaderStatus["type"], PillVariantProps["variant"]> = {
    Info: "grey",
    Attention: "orange",
    Success: "green",
    Error: "red",
};

type Props = {
    step: WorkflowStep;
    currentStepId: string | null;
};

export const StepCardHeader = ({step, currentStepId}: Props) => {
    const {t, l, i18n} = useTranslate("workflow");

    const deadlineDate =
        step.deadline?.date ??
        step.children?.find((c) => c.id == currentStepId)?.deadline?.date ??
        null;
    const isDeadlinePassed = getStepHierarchy(step).some((s) => s.deadline?.isPassed);

    const submittedDate =
        [step.dateCompleted, ...(step.children?.map((child) => child.dateCompleted) ?? [])]
            .filter((date): date is string => Boolean(date))
            .sort((a, b) => new Date(b).getTime() - new Date(a).getTime())[0] ?? null;

    return (
        <div className="flex w-full flex-col items-start gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex min-w-0 flex-wrap items-center gap-2">
                <Heading as="h2" className="font-semibold">
                    {l(step.title)}
                </Heading>
                {/* If we don't have a header status, we can show the date completed */}
                {step.dateCompleted && !step.headerStatus && (
                    <Pill variant="green">
                        {t("status.completed_on")}{" "}
                        {formatDateShort(step.dateCompleted, i18n.language)}
                    </Pill>
                )}
                {step.headerStatus && (
                    <Pill variant={HEADER_STATUS_VARIANT[step.headerStatus.type]}>
                        {l(step.headerStatus.label) ||
                            (isDeadlinePassed ? t("status.deadline_passed") : null)}
                    </Pill>
                )}
            </div>
            {submittedDate ? (
                <DateLabel
                    label={t("status.submitted")}
                    value={formatDateShort(submittedDate, i18n.language)}
                />
            ) : (
                deadlineDate && (
                    <DateLabel
                        label={t("progress.deadline")}
                        value={formatDateShortWithRelevantTime(
                            deadlineDate,
                            i18n.language,
                            `(${t("progress.amsterdam_time")})`,
                        )}
                    />
                )
            )}
        </div>
    );
};

const DateLabel = ({label, value}: {label: string; value: string}) => (
    <Text as="span" className="shrink-0">
        <Text fontWeight="semibold">{label}</Text>
        {":\t"}
        {value}
    </Text>
);
