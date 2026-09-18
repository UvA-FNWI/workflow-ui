import type {DeadlineChange, ExtendableDeadline} from "~/store/api/types/deadlines";
import type {WorkflowStep} from "~/store/api/types/instances";

export function deadlineDate(date: string): string {
    const parts = new Intl.DateTimeFormat("en-CA", {
        timeZone: "Europe/Amsterdam",
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
    }).formatToParts(new Date(date));
    const part = (name: string) => parts.find((p) => p.type === name)!.value;
    return `${part("year")}-${part("month")}-${part("day")}`;
}

export function postponeByDays(deadlines: ExtendableDeadline[], days: number): DeadlineChange[] {
    if (!Number.isSafeInteger(days) || days <= 0) return [];
    const maximum = remainingPostponementDays(deadlines);
    if (maximum != null && days > maximum) return [];
    const changes = deadlines.map((deadline) => {
        const date = new Date(`${deadlineDate(deadline.date)}T00:00:00Z`);
        date.setUTCDate(date.getUTCDate() + days);
        return {
            property: deadline.property,
            previousDate: deadline.date,
            newDate: Number.isNaN(date.getTime()) ? "" : date.toISOString().slice(0, 10),
        };
    });
    return changes.every((change) => /^\d{4}-\d{2}-\d{2}$/.test(change.newDate)) ? changes : [];
}

// Subtract calendar dates in UTC so daylight-saving transitions still count as one day.
export function remainingPostponementDays(deadlines: ExtendableDeadline[]): number | undefined {
    const remaining = deadlines.flatMap((deadline) =>
        deadline.maxDate
            ? [
                  Math.max(
                      0,
                      Math.round(
                          (Date.parse(`${deadline.maxDate}T00:00:00Z`) -
                              Date.parse(`${deadlineDate(deadline.date)}T00:00:00Z`)) /
                              86_400_000,
                      ),
                  ),
              ]
            : [],
    );
    return remaining.length ? Math.min(...remaining) : undefined;
}

// Reuse evaluated dates already present on the instance; a property reference opts into extension.
export function getExtendableDeadlines(steps: WorkflowStep[]): ExtendableDeadline[] {
    const deadlines = new Map<string, ExtendableDeadline>();
    const visit = (step: WorkflowStep) => {
        if (
            step.deadline?.property &&
            step.deadline.date &&
            !deadlines.has(step.deadline.property)
        ) {
            deadlines.set(step.deadline.property, {
                property: step.deadline.property,
                title: step.title,
                date: step.deadline.date,
                maxDate: step.deadline.maxDate,
            });
        }
        step.children?.forEach(visit);
    };
    steps.forEach(visit);
    return [...deadlines.values()];
}
