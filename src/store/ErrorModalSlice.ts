import {createSlice, type PayloadAction} from "@reduxjs/toolkit";

import type {RootState} from "~/store/store.ts";

type ErrorModalState = {
    open: boolean;
    message: string;
};

export const errorModalSlice = createSlice({
    name: "errorModal",
    initialState: {
        open: false,
        message: "",
    },
    reducers: {
        openErrorModal: (state, action: PayloadAction<string>) => {
            state.open = true;
            state.message = action.payload;
        },
        closeErrorModal: (state) => {
            state.open = false;
            state.message = "";
        },
    },
});

export const {openErrorModal, closeErrorModal} = errorModalSlice.actions;
export const selectErrorModal = (state: RootState): ErrorModalState => state.errorModal;
export default errorModalSlice.reducer;
