import type {Middleware} from "@reduxjs/toolkit";

import {clearImpersonation, setImpersonation} from "../authSlice";
import {saveImpersonationToken} from "./storage";

export const impersonationPersistMiddleware: Middleware = (store) => (next) => (action) => {
    const result = next(action);
    if (setImpersonation.match(action) || clearImpersonation.match(action)) {
        saveImpersonationToken(store.getState().auth.impersonation);
    }
    return result;
};
