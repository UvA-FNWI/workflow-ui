import {createSlice, type PayloadAction} from "@reduxjs/toolkit";

export type ApiErrorState = {code: number; message?: string; instanceId?: string};
const initialState: ApiErrorState = {code: 0, message: undefined, instanceId: undefined};

export const errorSlice = createSlice({
    name: "apiError",
    initialState,
    reducers: {
        triggerApiError: (state, action: PayloadAction<ApiErrorState>) => {
            state.code = action.payload.code;
            state.message = action.payload.message;
            state.instanceId = action.payload.instanceId;
        },
        resetApiError: (state) => {
            state.code = 0;
            state.message = undefined;
            state.instanceId = undefined;
        },
    },
});

export const {triggerApiError, resetApiError} = errorSlice.actions;
export const selectApiError = (state: {apiError: ApiErrorState}) => state.apiError;

export default errorSlice.reducer;
