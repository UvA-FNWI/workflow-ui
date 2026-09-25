export type MigrationKind = "RenameProperty";

export type MigrationStatus = "Applying" | "Finished" | "Failed";

export type Migration = {
    migrationId: string;
    scope: string;
    kind: MigrationKind;
    status: MigrationStatus;
    workflowDefinitions: string[];
    oldProperty: string;
    newProperty: string;
    requestedAt: string;
    updatedAt: string;
    finishedAt: string | null;
    itemsMatched: number;
    itemsUpdated: number;
    journalEntriesUpdated: number;
    error: string | null;
};
