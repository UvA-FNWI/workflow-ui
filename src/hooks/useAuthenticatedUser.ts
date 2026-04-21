import {useGetCurrentUserQuery} from "../store/api/usersApi";
import {selectAccessToken, selectCurrentUser} from "../store/authSlice";
import {useAppSelector} from "../store/store";

/**
 * Returns the authenticated user's data from Redux and the status of the
 * /Users/Me fetch. Auth state is driven by AuthProvider events in main.tsx
 * and the listener middleware in store.ts — this hook is read-only.
 */
export function useAuthenticatedUser() {
    const accessToken = useAppSelector(selectAccessToken);
    const currentUser = useAppSelector(selectCurrentUser);

    const {isLoading, isError} = useGetCurrentUserQuery(undefined, {skip: !accessToken});

    return {
        currentUser,
        isAuthenticated: !!accessToken,
        isLoading,
        isError,
    };
}
