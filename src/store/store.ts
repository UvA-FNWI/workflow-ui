import {useDispatch, useSelector} from "react-redux";

import {configureStore} from "@reduxjs/toolkit";
import type {Middleware} from "@reduxjs/toolkit";

import {baseApi} from "./api/baseApi";
import authReducer from "./authSlice";
import {saveImpersonationToken} from "./impersonationStorage";

export const store = configureStore({
    reducer: {
        auth: authReducer,
        [baseApi.reducerPath]: baseApi.reducer,
    },
    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware().concat(baseApi.middleware as Middleware),
});

// Persist impersonation token to localStorage when it changes
store.subscribe(() => {
    saveImpersonationToken(store.getState().auth.impersonation);
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export const useAppDispatch = useDispatch.withTypes<AppDispatch>();
export const useAppSelector = useSelector.withTypes<RootState>();
