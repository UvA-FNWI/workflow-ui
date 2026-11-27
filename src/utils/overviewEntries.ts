import type {WorkflowScreen as SearchableWorkflowScreen} from "~/components/Home/ScreenLink";
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

export type FromScreen = {
    workflowDefinition: string;
    screenName: string;
    title?: LocalString | null;
};

export type FromScreenLocationState = {
    fromScreen?: FromScreen;
};

export function readFromScreen(state: unknown): FromScreen | undefined {
    if (!state || typeof state !== "object" || !("fromScreen" in state)) return undefined;
    const fromScreen = (state as FromScreenLocationState).fromScreen;
    if (!fromScreen?.workflowDefinition || !fromScreen.screenName) return undefined;
    return fromScreen;
}

export function instanceFromScreenState(fromScreen: FromScreen): FromScreenLocationState {
    return {fromScreen};
}

/** Lowest-index screen of a definition — the register that owns its instances. */
export function primaryRegisterScreen(definition: WorkflowDefinition): WorkflowScreen | undefined {
    if (definition.screens.length === 0) return undefined;
    return definition.screens.reduce((best, screen) => {
        const bestIndex = best.index ?? Number.MAX_SAFE_INTEGER;
        const screenIndex = screen.index ?? Number.MAX_SAFE_INTEGER;
        return screenIndex < bestIndex ? screen : best;
    });
}

/** Primary line — matches coordinator {@link ScreenLink} on main (course / workflow title). */
function entryLabel(
    def: WorkflowDefinition,
    _screen: WorkflowScreen,
    l: (value: LocalString | null | undefined) => string,
) {
    return l(def.title) || def.name;
}

/**
 * Secondary line — {@link ScreenLink} subtitle, with optional {@link WorkflowDefinition.description}
 * from hub metadata when the API provides it (IBP registers).
 */
function entryDescription(
    def: WorkflowDefinition,
    screen: WorkflowScreen,
    l: (value: LocalString | null | undefined) => string,
) {
    if (def.description && l(def.description)) return l(def.description);
    return def.screens.length > 1 ? screen.name : l(def.titlePlural) || def.name;
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

/** Screens exposed on the coordinator home for global register search (DN-4112). */
export function buildSearchableScreens(
    definitions: WorkflowDefinition[],
): SearchableWorkflowScreen[] {
    return definitions.flatMap((definition) =>
        definition.screens.map((screen) => ({definition, name: screen.name})),
    );
}
