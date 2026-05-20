import {createSlice, type PayloadAction} from "@reduxjs/toolkit";

type ApiErrorState = {code: number};
const initialState: ApiErrorState = {code: 0};

export const errorSlice = createSlice({
    name: "apiError",
    initialState,
    reducers: {
        triggerApiError: (state, action: PayloadAction<number>) => {
            state.code = action.payload;
        },
        resetApiError: (state) => {
            state.code = 0;
        },
    },
});

export const {triggerApiError, resetApiError} = errorSlice.actions;
export const selectApiErrorCode = (state: {apiError: ApiErrorState}) => state.apiError.code;

export default errorSlice.reducer;
