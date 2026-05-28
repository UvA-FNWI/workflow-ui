import {createSlice, type PayloadAction} from "@reduxjs/toolkit";

import type {EffectResult} from "./api/types/submissions";
import type {RootState} from "./store";

const initialState: EffectResult = {
    redirectUrl: undefined,
    showConfetti: false,
    toast: undefined,
    error: undefined,
};

const effectsSlice = createSlice({
    name: "effects",
    initialState,
    reducers: {
        applyEffectResult: (state, action: PayloadAction<EffectResult>) => {
            if (action.payload.redirectUrl !== undefined) {
                state.redirectUrl = action.payload.redirectUrl;
            }

            if (action.payload.showConfetti !== undefined) {
                state.showConfetti = action.payload.showConfetti;
            }

            if (action.payload.toast !== undefined) {
                state.toast = action.payload.toast;
            }
            if (action.payload.error !== undefined && action.payload.error !== null) {
                state.error = {
                    type: "warning",
                    ...action.payload.error,
                };
            }
        },
        setShowConfetti: (state, action: PayloadAction<boolean>) => {
            state.showConfetti = action.payload;
        },
        clearRedirectUrl: (state) => {
            state.redirectUrl = undefined;
        },
        clearToast: (state) => {
            state.toast = undefined;
        },
        clearEffectError: (state) => {
            state.error = undefined;
        },
    },
});

export const {applyEffectResult, clearRedirectUrl, clearToast, clearEffectError, setShowConfetti} =
    effectsSlice.actions;

export const selectRedirectUrl = (state: RootState) => state.effects.redirectUrl;
export const selectShowConfetti = (state: RootState) => state.effects.showConfetti;
export const selectToast = (state: RootState) => state.effects.toast;
export const selectEffectError = (state: RootState) => state.effects.error;
export default effectsSlice.reducer;
