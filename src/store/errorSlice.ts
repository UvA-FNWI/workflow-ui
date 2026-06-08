import {createSlice, type PayloadAction} from "@reduxjs/toolkit";

import type {ApiErrorState} from "~/store/api/types/returnTypes.ts";

const initialState: ApiErrorState = {
    type: undefined,
    code: undefined,
    message: undefined,
    instanceId: undefined,
};

export const errorSlice = createSlice({
    name: "apiError",
    initialState,
    reducers: {
        triggerApiError: (state, action: PayloadAction<ApiErrorState>) => {
            state.type = action.payload.type;
            state.code = action.payload.code;
            state.message = action.payload.message;
            state.instanceId = action.payload.instanceId;
        },
        resetApiError: (state) => {
            state.type = undefined;
            state.code = undefined;
            state.message = undefined;
            state.instanceId = undefined;
        },
    },
});

export const {triggerApiError, resetApiError} = errorSlice.actions;
export const selectApiError = (state: {apiError: ApiErrorState}) => state.apiError;

export default errorSlice.reducer;
