export type MigrationKind = "RenameProperty";

export type MigrationStatus = "Applying" | "Finished" | "Failed";

export type Migration = {
    migrationId: string;
    kind: MigrationKind;
    status: MigrationStatus;
    statusLabel: string;
    workflowDefinitions: string[];
    oldProperty: string;
    newProperty: string;
    requestedBy: string;
    requestedAt: string;
    updatedAt: string;
    finishedAt: string | null;
    itemsMatched: number;
    itemsUpdated: number;
    journalEntriesUpdated: number;
    error: string | null;
};

export type CreatePropertyRename = {
    workflowDefinitions: string[];
    oldProperty: string;
    newProperty: string;
};
