export type VersionKind = "Baseline" | "Branch" | "Upload";

export interface VersionInfo {
    name: string;
    commit: string | null;
    loadedAt: string;
    kind: VersionKind;
}
