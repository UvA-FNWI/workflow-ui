import type {LocalString} from "~/hooks/useTranslate";
import type {WorkflowDefinition, WorkflowScreen} from "~/store/api/types/workflowDefinitions";

/** Fallback when the API omits a workflow definition icon (config: Entity.yaml `icon`). */
export const DEFAULT_OVERVIEW_ICON = "folder-open-line";

export type OverviewEntry = {
    key: string;
    workflowDefinition: string;
    screenName: string;
    title: string;
    subtitle: string;
    iconName: string;
    sortKey: number;
};

export const overviewScreenUrl = (workflowDefinition: string, screenName: string) =>
    `/screens/${workflowDefinition}/${screenName}`;

function entryLabel(
    def: WorkflowDefinition,
    screen: WorkflowScreen,
    l: (value: LocalString | null | undefined) => string,
) {
    return (screen.title && l(screen.title)) || l(def.titlePlural) || l(def.title) || def.name;
}

function entryDescription(
    def: WorkflowDefinition,
    screen: WorkflowScreen,
    l: (value: LocalString | null | undefined) => string,
) {
    return (
        (screen.description && l(screen.description)) ||
        (def.description ? l(def.description) : l(def.title)) ||
        ""
    );
}

export function buildOverviewEntries(
    definitions: WorkflowDefinition[],
    l: (value: LocalString | null | undefined) => string,
): OverviewEntry[] {
    return definitions
        .flatMap((def) =>
            def.screens.map((screen) => ({
                key: `${def.name}/${screen.name}`,
                workflowDefinition: def.name,
                screenName: screen.name,
                title: entryLabel(def, screen, l),
                subtitle: entryDescription(def, screen, l),
                iconName: def.icon?.type ?? DEFAULT_OVERVIEW_ICON,
                sortKey:
                    (def.index ?? Number.MAX_SAFE_INTEGER) * 1000 +
                    (screen.index ?? Number.MAX_SAFE_INTEGER),
            })),
        )
        .sort((left, right) => {
            if (left.sortKey !== right.sortKey) return left.sortKey - right.sortKey;
            return left.title.localeCompare(right.title);
        });
}
