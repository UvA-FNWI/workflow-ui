import type {ImpersonationResult} from "../api/types/instances";

const STORAGE_KEY = "workflow-impersonation-token";

export function loadPersistedImpersonationToken(): ImpersonationResult | null {
    try {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (!stored) return null;

        const parsed = JSON.parse(stored) as ImpersonationResult;
        const expiresAt = new Date(parsed.expiresAtUtc);
        if (expiresAt <= new Date()) {
            localStorage.removeItem(STORAGE_KEY);
            return null;
        }

        return parsed;
    } catch {
        return null;
    }
}

export function saveImpersonationToken(token: ImpersonationResult | null): void {
    try {
        if (token === null) {
            localStorage.removeItem(STORAGE_KEY);
        } else {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(token));
        }
    } catch (error) {
        console.error("Error saving impersonation token:", error);
    }
}
