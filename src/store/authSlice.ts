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
    currentUser: CurrentUser | null;
    /** Single impersonation token. Replaced when impersonating elsewhere. Persisted to localStorage. */
    impersonation: ImpersonationResult | null;
};

const initialState: AuthState = {
    currentUser: null,
    impersonation: loadPersistedImpersonationToken(),
};

const authSlice = createSlice({
    name: "auth",
    initialState,
    reducers: {
        setCurrentUser: (state, action: PayloadAction<CurrentUser | null>) => {
            state.currentUser = action.payload;
        },
        clearCurrentUser: (state) => {
            state.currentUser = null;
        },
        setImpersonation: (state, action: PayloadAction<ImpersonationResult>) => {
            state.impersonation = action.payload;
        },
        clearImpersonation: (state) => {
            state.impersonation = null;
        },
    },
});

export const {setCurrentUser, clearCurrentUser, setImpersonation, clearImpersonation} =
    authSlice.actions;

export const selectCurrentUser = (state: RootState) => state.auth.currentUser;
export const selectImpersonation = (state: RootState) => state.auth.impersonation;
export const selectImpersonationForInstance = (state: RootState, instanceId: string | undefined) =>
    state.auth.impersonation?.instanceId === instanceId ? state.auth.impersonation : null;
export const selectImpersonationToken = (state: RootState) => selectImpersonation(state)?.token;

export default authSlice.reducer;
