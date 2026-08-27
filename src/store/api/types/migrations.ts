export type MigrationKind = "RenameProperty";

export type MigrationStatus =
    | "Applying"
    | "ReadyToFinish"
    | "Finishing"
    | "Finished"
    | "Reverting"
    | "Reverted"
    | "ApplyFailed"
    | "FinishFailed"
    | "RevertFailed";

export type RenamePropertyDefinition = {
    workflowDefinitions: string[];
    oldProperty: string;
    newProperty: string;
};

export type MigrationProgress = {
    itemsMatched: number;
    itemsUpdated: number;
    details: Record<string, number>;
};

export type Migration = {
    id: string;
    kind: MigrationKind;
    status: MigrationStatus;
    statusLabel: string;
    definition: RenamePropertyDefinition;
    requestedBy: string;
    requestedAt: string;
    updatedAt: string;
    finishedAt: string | null;
    progress: MigrationProgress;
    error: string | null;
};

export type CreatePropertyRename = {
    workflowDefinitions: string[];
    oldProperty: string;
    newProperty: string;
};
