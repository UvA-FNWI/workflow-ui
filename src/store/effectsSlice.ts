import {createSlice, type PayloadAction} from "@reduxjs/toolkit";

import type {EffectResult} from "./api/types/submissions";
import type {RootState} from "./store";

const initialState: EffectResult = {
    redirectUrl: undefined,
    showConfetti: false,
    showToast: undefined,
};

const effectsSlice = createSlice({
    name: "effects",
    initialState,
    reducers: {
        applyEffectResult: (state, action: PayloadAction<EffectResult | undefined>) => {
            if (!action.payload) {
                return;
            }

            if (action.payload.redirectUrl !== undefined) {
                state.redirectUrl = action.payload.redirectUrl;
            }

            if (action.payload.showConfetti !== undefined) {
                state.showConfetti = action.payload.showConfetti;
            }

            if (action.payload.showToast !== undefined) {
                state.showToast = action.payload.showToast;
            }
        },
        setShowConfetti: (state, action: PayloadAction<boolean>) => {
            state.showConfetti = action.payload;
        },
        clearRedirectUrl: (state) => {
            state.redirectUrl = undefined;
        },
        clearShowToast: (state) => {
            state.showToast = undefined;
        },
    },
});

export const {applyEffectResult, clearRedirectUrl, clearShowToast, setShowConfetti} =
    effectsSlice.actions;

export const selectRedirectUrl = (state: RootState) => state.effects.redirectUrl;
export const selectShowConfetti = (state: RootState) => state.effects.showConfetti;
export const selectShowToast = (state: RootState) => state.effects.showToast;

export default effectsSlice.reducer;
