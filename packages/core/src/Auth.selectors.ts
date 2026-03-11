// Lib
import type {AuthState} from "./Auth.state";

export const selectAuthUser = (state: AuthState) => state.user;

export const selectAuthStatus = (state: AuthState) => (state.isLoading ? "pending" : "fulfilled");

export const selectAuthProviderType = (state: AuthState) => state.providerType;

export const selectIsAuthenticated = (state: AuthState) => state.isAuthenticated;
