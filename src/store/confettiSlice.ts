import {createSlice, type PayloadAction} from "@reduxjs/toolkit";

import type {RootState} from "./store";

export type ConfettiState = {
    isActive: boolean;
};

const initialState: ConfettiState = {
    isActive: false,
};

const confettiSlice = createSlice({
    name: "confetti",
    initialState,
    reducers: {
        setConfettiActive: (state, action: PayloadAction<boolean>) => {
            state.isActive = action.payload;
        },
    },
});

export const {setConfettiActive} = confettiSlice.actions;

export const selectIsActive = (state: RootState) => state.confetti.isActive;

export default confettiSlice.reducer;
