import {Icon, Tooltip} from "@uva-fnwi/datanose-ui";

import {useTranslate} from "~/hooks/useTranslate";
import type {WorkflowStep} from "~/store/api/types/instances";

const MIN_POSITION = 10;
const MAX_POSITION = 90;
const POSITION_RANGE = MAX_POSITION - MIN_POSITION;

interface WorkflowProgressBarProps {
    steps: WorkflowStep[];
    currentStep: string;
}

const getCurrentStepIndex = (steps: WorkflowStep[], currentStep: string): number =>
    steps.findIndex(
        (step) =>
            step.id === currentStep || step.children?.some((child) => child.id === currentStep),
    );

const getEvenPosition = (index: number, totalSteps: number): number => {
    if (totalSteps <= 1) return MIN_POSITION;
    return MIN_POSITION + (index / (totalSteps - 1)) * POSITION_RANGE;
};

/** Linearly interpolate positions for steps strictly between two anchor points. */
const interpolateBetween = (
    positions: (number | null)[],
    fromAnchorIdx: number,
    fromAnchorPos: number,
    toAnchorIdx: number,
    toAnchorPos: number,
) => {
    const span = toAnchorIdx - fromAnchorIdx;
    if (span <= 1) return;
    for (let i = fromAnchorIdx + 1; i < toAnchorIdx; i++) {
        positions[i] = fromAnchorPos + ((i - fromAnchorIdx) / span) * (toAnchorPos - fromAnchorPos);
    }
};

/**
 * Calculates the horizontal position (as a percentage between MIN_POSITION and MAX_POSITION)
 * for each step along the progress bar.
 *
 * Position strategy:
 * - If there are fewer than 2 steps with deadlines, all steps are spaced evenly.
 * - If all deadlines are identical, all steps are spaced evenly.
 * - Otherwise, steps that have a deadline are positioned proportionally to their deadline
 *   timestamp: the earliest deadline maps to the left anchor and the latest to the right anchor.
 *   The anchors themselves are derived from evenly-spaced positions so that steps without
 *   deadlines at the edges still get reasonable padding.
 * - Steps without a deadline that fall between two deadline-anchored steps are linearly
 *   interpolated between those two anchors.
 * - Steps without a deadline before the first deadline-anchored step are interpolated between
 *   MIN_POSITION and that anchor.
 * - Steps without a deadline after the last deadline-anchored step are interpolated between
 *   that anchor and MAX_POSITION.
 */
const getStepPositions = (steps: WorkflowStep[]): number[] => {
    if (steps.length <= 1) return steps.map(() => MIN_POSITION);

    const deadlines = steps.map((step) =>
        step.deadline ? new Date(step.deadline).getTime() : null,
    );
    const deadlineIndices = deadlines.reduce<number[]>((acc, d, i) => {
        if (d !== null) acc.push(i);
        return acc;
    }, []);

    if (deadlineIndices.length < 2) {
        return steps.map((_, i) => getEvenPosition(i, steps.length));
    }

    const deadlineValues = deadlineIndices.map((i) => deadlines[i]!);
    const minDeadline = Math.min(...deadlineValues);
    const maxDeadline = Math.max(...deadlineValues);

    if (minDeadline === maxDeadline) {
        return steps.map((_, i) => getEvenPosition(i, steps.length));
    }

    // Reserve space for non-deadline boundary steps by mapping deadlines to a sub-range
    const firstIdx = deadlineIndices[0];
    const lastIdx = deadlineIndices[deadlineIndices.length - 1];
    const rangeStart = getEvenPosition(firstIdx, steps.length);
    const rangeEnd = getEvenPosition(lastIdx, steps.length);
    const deadlineRange = rangeEnd - rangeStart;

    const positions: (number | null)[] = steps.map((_, i) => {
        if (deadlines[i] === null) return null;
        return (
            rangeStart +
            ((deadlines[i]! - minDeadline) / (maxDeadline - minDeadline)) * deadlineRange
        );
    });

    // Set and interpolate non-deadline steps before the first deadline
    if (firstIdx > 0) {
        positions[0] = MIN_POSITION;
        interpolateBetween(positions, 0, MIN_POSITION, firstIdx, positions[firstIdx]!);
    }

    // Interpolate non-deadline steps between deadline steps
    for (let d = 0; d < deadlineIndices.length - 1; d++) {
        interpolateBetween(
            positions,
            deadlineIndices[d],
            positions[deadlineIndices[d]]!,
            deadlineIndices[d + 1],
            positions[deadlineIndices[d + 1]]!,
        );
    }

    // Set and interpolate non-deadline steps after the last deadline
    if (lastIdx < steps.length - 1) {
        positions[steps.length - 1] = MAX_POSITION;
        interpolateBetween(positions, lastIdx, positions[lastIdx]!, steps.length - 1, MAX_POSITION);
    }

    return positions.map((position, i) => position ?? getEvenPosition(i, steps.length));
};

const getProgressPercentage = (positions: number[], currentStepIndex: number): number => {
    if (positions.length === 0) return 0;
    if (currentStepIndex === -1) return 0;

    return Math.round(positions[currentStepIndex]);
};

export const WorkflowProgressBar = ({steps, currentStep}: WorkflowProgressBarProps) => {
    const {l, t, i18n} = useTranslate("workflow");
    const currentStepIndex = getCurrentStepIndex(steps, currentStep);
    const positions = getStepPositions(steps);
    const progress = getProgressPercentage(positions, currentStepIndex);

    const formatDeadline = (deadline: string) =>
        new Date(deadline).toLocaleDateString(i18n.language, {
            day: "numeric",
            month: "long",
            year: "numeric",
        });

    return (
        <div className="flex w-full flex-col gap-2">
            <div className="relative h-8">
                {steps.map((step, index) => {
                    const isCompleted = index < currentStepIndex;
                    const position = positions[index];

                    return (
                        <div
                            key={step.id}
                            className="absolute -translate-x-1/2"
                            style={{left: `${position}%`}}
                        >
                            <Tooltip
                                content={
                                    <span className="flex flex-col items-center">
                                        <span>{l(step.title) ?? step.id}</span>
                                        {step.deadline && (
                                            <span>
                                                {t("progress.deadline")}:{" "}
                                                {formatDeadline(step.deadline)}
                                            </span>
                                        )}
                                    </span>
                                }
                            >
                                <span
                                    className={`flex items-center justify-center rounded-full border p-1 ${
                                        isCompleted
                                            ? "border-red-brand bg-red-brand text-white"
                                            : "border-red-brand bg-white text-red-brand"
                                    }`}
                                >
                                    <Icon
                                        name={
                                            (step.icon as Parameters<typeof Icon>[0]["name"]) ??
                                            (isCompleted ? "checkmark-solid" : "circle-solid")
                                        }
                                        size="sm"
                                        color="current"
                                        decorative
                                    />
                                </span>
                            </Tooltip>
                        </div>
                    );
                })}
            </div>
            <div className="flex h-2 w-full overflow-hidden rounded-full bg-grey-200">
                {progress > 0 && (
                    <div
                        className="bg-red-brand transition-all duration-300"
                        style={{width: `${progress}%`}}
                    />
                )}
            </div>
        </div>
    );
};
