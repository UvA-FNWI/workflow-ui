import {createSlice, type PayloadAction} from "@reduxjs/toolkit";

type OpenFormState = {
    formId: string | null;
    instanceId: string | null;
};

const initialState: OpenFormState = {formId: null, instanceId: null};

const openFormSlice = createSlice({
    name: "openForm",
    initialState,
    reducers: {
        setOpenForm(state, action: PayloadAction<OpenFormState>) {
            state.formId = action.payload.formId;
            state.instanceId = action.payload.instanceId;
        },
    },
});

export const {setOpenForm} = openFormSlice.actions;
export default openFormSlice.reducer;
