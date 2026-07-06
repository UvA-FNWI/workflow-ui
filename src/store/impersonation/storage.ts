import type {RoleImpersonationResult} from "../api/types/instances";
import type {UserImpersonation} from "../api/types/users";

const ROLE_STORAGE_KEY = "workflow-impersonation-token";
const USER_STORAGE_KEY = "workflow-user-impersonation-token";

// Loads a persisted token, dropping it once expired.
function loadExpiring<T extends {expiresAtUtc: string}>(key: string): T | null {
    try {
        const stored = localStorage.getItem(key);
        if (!stored) return null;

        const parsed = JSON.parse(stored) as T;
        if (new Date(parsed.expiresAtUtc) <= new Date()) {
            localStorage.removeItem(key);
            return null;
        }

        return parsed;
    } catch {
        return null;
    }
}

function savePersisted<T>(key: string, value: T | null): void {
    try {
        if (value === null) {
            localStorage.removeItem(key);
        } else {
            localStorage.setItem(key, JSON.stringify(value));
        }
    } catch (error) {
        console.error(`Error saving ${key}:`, error);
    }
}

export const loadPersistedRoleImpersonation = (): RoleImpersonationResult | null =>
    loadExpiring<RoleImpersonationResult>(ROLE_STORAGE_KEY);

export const saveRoleImpersonation = (token: RoleImpersonationResult | null): void =>
    savePersisted(ROLE_STORAGE_KEY, token);

export const loadPersistedUserImpersonation = (): UserImpersonation | null =>
    loadExpiring<UserImpersonation>(USER_STORAGE_KEY);

export const saveUserImpersonation = (value: UserImpersonation | null): void =>
    savePersisted(USER_STORAGE_KEY, value);
