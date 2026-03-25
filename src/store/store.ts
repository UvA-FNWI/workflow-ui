import {useDispatch, useSelector} from "react-redux";

import {configureStore, createListenerMiddleware} from "@reduxjs/toolkit";
import type {Middleware} from "@reduxjs/toolkit";

import {baseApi} from "./api/baseApi";
import {usersApi} from "./api/usersApi";
import {setAccessToken, setCurrentUser} from "./authSlice";
import authReducer from "./authSlice";
import confettiReducer from "./confettiSlice";
import {impersonationPersistMiddleware} from "./impersonation";

const listenerMiddleware = createListenerMiddleware();

// When the access token is set (login / page-refresh restore), fetch the current user.
listenerMiddleware.startListening({
    actionCreator: setAccessToken,
    effect: (action, {dispatch}) => {
        if (action.payload) {
            void dispatch(usersApi.endpoints.getCurrentUser.initiate());
        }
    },
});

// When the getCurrentUser query fulfills, update authSlice with the API result.
listenerMiddleware.startListening({
    matcher: usersApi.endpoints.getCurrentUser.matchFulfilled,
    effect: (action, {dispatch}) => {
        dispatch(setCurrentUser(action.payload));
    },
});

export const store = configureStore({
    reducer: {
        auth: authReducer,
        confetti: confettiReducer,
        [baseApi.reducerPath]: baseApi.reducer,
    },
    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware()
            .concat(listenerMiddleware.middleware)
            .concat(impersonationPersistMiddleware)
            .concat(baseApi.middleware as Middleware),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export const useAppDispatch = useDispatch.withTypes<AppDispatch>();
export const useAppSelector = useSelector.withTypes<RootState>();
