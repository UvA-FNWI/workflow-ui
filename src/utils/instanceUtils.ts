import type {WorkflowStep} from "~/store/api/types/instances.ts";

/**
 * Returns the IDs of all descendants of a step with the given ID.
 */
export function getDescendantIds(steps: WorkflowStep[], targetId: string): string[] {
    for (const step of steps) {
        if (step.id === targetId) {
            const collect = (s: typeof step): string[] => [
                s.id,
                ...(s.children?.flatMap(collect) ?? []),
            ];
            return collect(step);
        }
        if (step.children) {
            const found = getDescendantIds(step.children, targetId);
            if (found.length) return found;
        }
    }
    return [];
}
