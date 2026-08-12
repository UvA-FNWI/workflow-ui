import {useState} from "react";

import {Button, Icon, Link, Text} from "@uva-fnwi/datanose-ui";

import {UserAvatar} from "~/components/instance/UserAvatar.tsx";
import {EditEmailModal} from "~/components/StaffCard/EditEmailModal.tsx";
import {RemoveStaffMemberModal} from "~/components/StaffCard/RemoveStaffMemberModal.tsx";
import {useTranslate} from "~/hooks/useTranslate.ts";
import {baseApi} from "~/store/api/baseApi.ts";
import {instancesEndpoints} from "~/store/api/instancesApi.ts";
import type {RelatedUserRoles, Role} from "~/store/api/types/instances.ts";
import type {UserSearchResult} from "~/store/api/types/users.ts";
import {useUpdateUserEmailMutation} from "~/store/api/usersApi.ts";
import {useAppDispatch} from "~/store/store.ts";

type RelatedStaffInfoProps = {
    instanceId?: string;
    relatedUserRoles: RelatedUserRoles;
    canEdit?: boolean;
    onAddUser?: (allowsExternalUsers: boolean, role?: Role, disableRoleSelection?: boolean) => void;
};

export function RelatedStaffInfo({
    instanceId,
    relatedUserRoles,
    canEdit = false,
    onAddUser,
}: RelatedStaffInfoProps) {
    const {t, l} = useTranslate("workflow");
    const {role, users, title, allowsExternalUsers, allowsAssignment, allowsMultipleUsers} =
        relatedUserRoles;
    const [editingUser, setEditingUser] = useState<UserSearchResult | null>(null);
    const [removingUser, setRemovingUser] = useState<UserSearchResult | null>(null);
    const [updateUserEmail, {isLoading: isUpdatingEmail}] = useUpdateUserEmailMutation();
    const [removeRelatedUser] = instancesEndpoints.removeRelatedUser.useMutation();
    const dispatch = useAppDispatch();

    const handleSave = async (updatedUser: UserSearchResult) => {
        if (!users || users.length <= 0 || !updatedUser.id || !instanceId) {
            return;
        }

        await updateUserEmail({
            userId: updatedUser.id,
            email: updatedUser.email,
            instanceId,
        }).unwrap();

        dispatch(baseApi.util.invalidateTags([{type: "Instance", id: instanceId}]));
    };

    const handleRemoveUser = async () => {
        if (!instanceId || !relatedUserRoles || !removingUser || !removingUser.id) return;
        removeRelatedUser({
            instanceId,
            property: relatedUserRoles.role,
            userId: removingUser.id,
        });
        setRemovingUser(null);
    };

    if (canEdit && users.length === 0 && allowsAssignment) {
        return (
            <div className="flex min-w-0 flex-col items-start gap-2 pb-8">
                <Text fontWeight="semibold">{l(title)}</Text>
                <Button
                    intent="secondary"
                    variant="destructive"
                    leftIcon={<Icon name="plus-solid" color="current" />}
                    onClick={() => onAddUser?.(allowsExternalUsers, {name: role, title}, true)}
                >
                    {t("add")}
                </Button>
            </div>
        );
    }

    if (!users) {
        return;
    }

    const canBeRemoved = canEdit && relatedUserRoles.allowsMultipleUsers && users.length > 1;

    return (
        <>
            {users.map((user, index) => (
                <div key={index} className="flex flex-col pb-8">
                    <UserAvatar userName={user.displayName} picture={user.picture} />
                    {index === 0 && (
                        <div className="flex min-w-0 gap-1">
                            <Text fontWeight="semibold">{l(title)}</Text>
                            <div className="flex flex-row items-center gap-1">
                                {canEdit && (
                                    <Button
                                        intent="ghost"
                                        size="small"
                                        shape="circular"
                                        className="ui:ml-1 ui:border-0 ui:px-1 ui:align-middle ui:hover:enabled:bg-grey-100 ui:dark:hover:enabled:bg-grey-800"
                                        onClick={() =>
                                            onAddUser?.(
                                                allowsExternalUsers,
                                                {name: role, title},
                                                true,
                                            )
                                        }
                                    >
                                        <Icon
                                            name={allowsMultipleUsers ? "plus-line" : "edit-line"}
                                            size="xs"
                                            color="danger"
                                        />
                                    </Button>
                                )}
                            </div>
                        </div>
                    )}
                    <div className="flex min-w-0 gap-1">
                        <Text>{user.displayName}</Text>
                        {canBeRemoved && (
                            <Button
                                intent="ghost"
                                size="small"
                                shape="circular"
                                className="ui:ml-1 ui:border-0 ui:px-1 ui:align-middle ui:hover:enabled:bg-grey-100 ui:dark:hover:enabled:bg-grey-800"
                                onClick={() => setRemovingUser(user)}
                            >
                                <Icon name="trash-line" size="xs" color="danger" />
                            </Button>
                        )}
                    </div>
                    {user.organization && <Text>{user.organization?.name}</Text>}
                    <div className="flex flex-row items-center gap-1">
                        <div className="flex flex-row items-center gap-2">
                            <Icon
                                className="flex-none"
                                name="email-line"
                                color="current"
                                size="md"
                            />
                            <Link underline className="truncate" href={`mailto:${user.email}`}>
                                {user.email}
                            </Link>
                        </div>
                        {canEdit && user.isExternal && user.requiresInvitation && (
                            <Button
                                intent="ghost"
                                size="small"
                                shape="circular"
                                className="ui:ml-1 ui:border-0 ui:px-1 ui:align-middle ui:hover:enabled:bg-grey-100 ui:dark:hover:enabled:bg-grey-800"
                                onClick={() => setEditingUser(user)}
                                aria-label={t("instance.summary.edit_answer")}
                            >
                                <Icon name="edit-line" size="xs" color="danger" />
                            </Button>
                        )}
                    </div>
                </div>
            ))}
            {editingUser && (
                <EditEmailModal
                    isOpen={!!editingUser}
                    setIsOpen={(open) => !open && setEditingUser(null)}
                    user={editingUser}
                    onSave={handleSave}
                    isSaving={isUpdatingEmail}
                />
            )}
            {removingUser && (
                <RemoveStaffMemberModal
                    isOpen={!!removingUser}
                    setIsOpen={(open) => !open && setRemovingUser(null)}
                    onConfirm={handleRemoveUser}
                    user={removingUser}
                />
            )}
        </>
    );
}
