import {createSlice, type PayloadAction} from "@reduxjs/toolkit";

import {clearCurrentUser, setCurrentUser} from "./authSlice";

const initialState = {
    homePath: "/",
    coordinatorPath: "/",
    userName: "",
};

const homeNavigationSlice = createSlice({
    name: "homeNavigation",
    initialState,
    reducers: {
        rememberHomePath(state, {payload}: PayloadAction<string>) {
            state.homePath = payload;
            if (payload !== "/personal") state.coordinatorPath = payload;
        },
    },
    extraReducers: (builder) => {
        builder.addCase(clearCurrentUser, () => initialState);
        builder.addCase(setCurrentUser, (state, {payload}) => {
            const userName = payload?.userName ?? "";
            if (userName !== state.userName) return {...initialState, userName};
        });
    },
});

export const {rememberHomePath} = homeNavigationSlice.actions;
export default homeNavigationSlice.reducer;
