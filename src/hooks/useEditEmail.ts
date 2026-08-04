import {useState} from "react";

import {baseApi} from "~/store/api/baseApi.ts";
import type {CreateExternalUserInput, UserSearchResult} from "~/store/api/types/users.ts";
import {useUpdateUserEmailMutation} from "~/store/api/usersApi.ts";
import {useAppDispatch} from "~/store/store.ts";

export function useEditEmail(instanceId?: string) {
    const [editingUser, setEditingUser] = useState<UserSearchResult | null>(null);
    const [updateUserEmail, {isLoading: isUpdatingEmail}] = useUpdateUserEmailMutation();
    const dispatch = useAppDispatch();

    const handleSave = async (updatedUser: UserSearchResult) => {
        if (!updatedUser.id || !instanceId) return;
        const externalUser: CreateExternalUserInput = {
            userId: updatedUser.id,
            email: updatedUser.email,
            displayName: updatedUser.displayName,
            organization: updatedUser.organization,
        };
        await updateUserEmail({externalUser, instanceId}).unwrap();
        dispatch(baseApi.util.invalidateTags([{type: "Instance", id: instanceId}]));
    };

    return {editingUser, setEditingUser, handleSave, isUpdatingEmail};
}
