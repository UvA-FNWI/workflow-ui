import {createSlice, type PayloadAction} from "@reduxjs/toolkit";

import type {ImpersonationResult} from "./api/types/instances";
import {loadPersistedImpersonationToken} from "./impersonation";
import type {RootState} from "./store";

export type CurrentUser = {
    userName: string;
    displayName: string;
    email: string;
};

export type AuthState = {
    accessToken: string | null;
    currentUser: CurrentUser | null;
    showSessionExpiredModal: boolean;
    /** Single impersonation token. Replaced when impersonating elsewhere. Persisted to localStorage. */
    impersonation: ImpersonationResult | null;
};

const initialState: AuthState = {
    accessToken: null,
    currentUser: null,
    showSessionExpiredModal: false,
    impersonation: loadPersistedImpersonationToken(),
};

const authSlice = createSlice({
    name: "auth",
    initialState,
    reducers: {
        setAccessToken: (state, action: PayloadAction<string | null>) => {
            state.accessToken = action.payload;
            state.showSessionExpiredModal = false;
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
        setImpersonation: (state, action: PayloadAction<ImpersonationResult>) => {
            state.impersonation = action.payload;
        },
        clearImpersonation: (state) => {
            state.impersonation = null;
        },
    },
});

export const {
    setAccessToken,
    setCurrentUser,
    clearCurrentUser,
    openSessionExpiredModal,
    setImpersonation,
    clearImpersonation,
} = authSlice.actions;

export const selectAccessToken = (state: RootState) => state.auth.accessToken;
export const selectCurrentUser = (state: RootState) => state.auth.currentUser;
export const selectShowSessionExpiredModal = (state: RootState) =>
    state.auth.showSessionExpiredModal;
export const selectImpersonation = (state: RootState) => state.auth.impersonation;
export const selectImpersonationForInstance = (state: RootState, instanceId: string | undefined) =>
    state.auth.impersonation?.instanceId === instanceId ? state.auth.impersonation : null;
export const selectImpersonationToken = (state: RootState) => selectImpersonation(state)?.token;

export default authSlice.reducer;
