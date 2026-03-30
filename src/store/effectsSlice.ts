import {createSlice, type PayloadAction} from "@reduxjs/toolkit";

import type {EffectResult} from "./api/types/submissions";
import type {RootState} from "./store";

const initialState: EffectResult = {
    showConfetti: false,
};

const effectsSlice = createSlice({
    name: "effects",
    initialState,
    reducers: {
        setShowConfetti: (state, action: PayloadAction<boolean>) => {
            state.showConfetti = action.payload;
        },
    },
});

export const {setShowConfetti} = effectsSlice.actions;

export const selectShowConfetti = (state: RootState) => state.effects.showConfetti;

export default effectsSlice.reducer;
