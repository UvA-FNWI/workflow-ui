import {createSlice, type PayloadAction} from "@reduxjs/toolkit";

import type {RoleImpersonationResult} from "./api/types/instances";
import type {UserImpersonation} from "./api/types/users";
import {loadPersistedRoleImpersonation, loadPersistedUserImpersonation} from "./impersonation";
import type {RootState} from "./store";

export type CurrentUser = {
    userName: string;
    displayName: string;
    email: string;
    isSuperAdmin: boolean;
};

export type AuthState = {
    accessToken: string | null;
    currentUser: CurrentUser | null;
    showSessionExpiredModal: boolean;
    /** Instance-scoped role impersonation token. Replaced when impersonating elsewhere. Persisted to localStorage. */
    roleImpersonation: RoleImpersonationResult | null;
    /** Global user impersonation (super admin). Persisted to localStorage. */
    userImpersonation: UserImpersonation | null;
};

const initialState: AuthState = {
    accessToken: null,
    currentUser: null,
    showSessionExpiredModal: false,
    roleImpersonation: loadPersistedRoleImpersonation(),
    userImpersonation: loadPersistedUserImpersonation(),
};

const authSlice = createSlice({
    name: "auth",
    initialState,
    reducers: {
        setAccessToken: (state, action: PayloadAction<string | null>) => {
            state.accessToken = action.payload;
            state.showSessionExpiredModal = false;
            // On logout, stop impersonating.
            if (action.payload === null) {
                state.userImpersonation = null;
            }
        },
        setCurrentUser: (state, action: PayloadAction<CurrentUser | null>) => {
            state.currentUser = action.payload;
        },
        clearCurrentUser: (state) => {
            state.currentUser = null;
        },
        openSessionExpiredModal: (state) => {
            state.showSessionExpiredModal = true;
        },
        setRoleImpersonation: (state, action: PayloadAction<RoleImpersonationResult>) => {
            state.roleImpersonation = action.payload;
        },
        clearRoleImpersonation: (state) => {
            state.roleImpersonation = null;
        },
        setUserImpersonation: (state, action: PayloadAction<UserImpersonation>) => {
            state.userImpersonation = action.payload;
            // Becoming another user globally supersedes any instance-role impersonation, which is
            // bound to the real admin.
            state.roleImpersonation = null;
        },
        clearUserImpersonation: (state) => {
            state.userImpersonation = null;
        },
    },
});

export const {
    setAccessToken,
    setCurrentUser,
    clearCurrentUser,
    openSessionExpiredModal,
    setRoleImpersonation,
    clearRoleImpersonation,
    setUserImpersonation,
    clearUserImpersonation,
} = authSlice.actions;

export const selectAccessToken = (state: RootState) => state.auth.accessToken;
export const selectCurrentUser = (state: RootState) => state.auth.currentUser;
export const selectShowSessionExpiredModal = (state: RootState) =>
    state.auth.showSessionExpiredModal;
export const selectRoleImpersonation = (state: RootState) => state.auth.roleImpersonation;
export const selectRoleImpersonationForInstance = (
    state: RootState,
    instanceId: string | undefined,
) =>
    state.auth.roleImpersonation?.instanceId === instanceId ? state.auth.roleImpersonation : null;
export const selectRoleImpersonationToken = (state: RootState) =>
    selectRoleImpersonation(state)?.token;
export const selectUserImpersonation = (state: RootState) => state.auth.userImpersonation;
export const selectUserImpersonationToken = (state: RootState) =>
    selectUserImpersonation(state)?.token;

export default authSlice.reducer;
