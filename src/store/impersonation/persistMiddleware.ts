import type {Middleware} from "@reduxjs/toolkit";

import {
    clearRoleImpersonation,
    clearUserImpersonation,
    setAccessToken,
    setRoleImpersonation,
    setUserImpersonation,
} from "../authSlice";
import {saveRoleImpersonation, saveUserImpersonation} from "./storage";

export const impersonationPersistMiddleware: Middleware = (store) => (next) => (action) => {
    const result = next(action);
    const {roleImpersonation, userImpersonation} = store.getState().auth;

    // setUserImpersonation also clears the role token, so persist it here too.
    if (
        setRoleImpersonation.match(action) ||
        clearRoleImpersonation.match(action) ||
        setUserImpersonation.match(action)
    ) {
        saveRoleImpersonation(roleImpersonation);
    }

    // Logout clears the user impersonation, so persist that removal.
    if (
        setUserImpersonation.match(action) ||
        clearUserImpersonation.match(action) ||
        (setAccessToken.match(action) && action.payload === null)
    ) {
        saveUserImpersonation(userImpersonation);
    }

    return result;
};
