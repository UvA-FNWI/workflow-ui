import {useState} from "react";

import {Button, Icon, Link, Text} from "@uva-fnwi/datanose-ui";

import {UserAvatar} from "~/components/instance/UserAvatar.tsx";
import {EditEmailModal} from "~/components/StaffCard/EditEmailModal.tsx";
import {RemoveStaffMemberModal} from "~/components/StaffCard/RemoveStaffMemberModal.tsx";
import {useTranslate} from "~/hooks/useTranslate.ts";
import {baseApi} from "~/store/api/baseApi.ts";
import {instancesEndpoints} from "~/store/api/instancesApi.ts";
import type {RelatedUser, Role} from "~/store/api/types/instances.ts";
import type {UserSearchResult} from "~/store/api/types/users.ts";
import {useUpdateUserEmailMutation} from "~/store/api/usersApi.ts";
import {useAppDispatch} from "~/store/store.ts";

type RelatedStaffInfoProps = {
    instanceId?: string;
    relatedUser: RelatedUser;
    canEdit?: boolean;
    isEmailEditable?: boolean;
    onAddUser?: (allowsExternalUsers: boolean, role?: Role) => void;
};

export function RelatedStaffInfo({
    instanceId,
    relatedUser,
    canEdit = false,
    isEmailEditable = false,
    onAddUser,
}: RelatedStaffInfoProps) {
    const {t, l} = useTranslate("workflow");
    const {role, user, title, allowsExternalUsers, allowsAssignment} = relatedUser;
    const [isEditing, setIsEditing] = useState(false);
    const [isRemoving, setIsRemoving] = useState(false);
    const [updateUserEmail, {isLoading: isUpdatingEmail}] = useUpdateUserEmailMutation();
    const [updateProperty] = instancesEndpoints.updateProperty.useMutation();
    const dispatch = useAppDispatch();

    const handleSave = async (updatedUser: UserSearchResult) => {
        if (!user || !user?.id || !instanceId) {
            return;
        }

        await updateUserEmail({
            userId: user.id,
            email: updatedUser.email,
            instanceId,
        }).unwrap();

        dispatch(baseApi.util.invalidateTags([{type: "Instance", id: instanceId}]));
    };

    const handleRemoveUser = async () => {
        if (!instanceId || !relatedUser) return;
        updateProperty({
            instanceId,
            property: relatedUser.role,
            value: null,
            externalUser: undefined,
        });
        setIsRemoving(false);
    };

    if (canEdit && !user && allowsAssignment) {
        return (
            <div className="flex min-w-0 flex-col items-start gap-2 pb-8">
                <Text fontWeight="semibold">{l(title)}</Text>
                <Button
                    intent="secondary"
                    variant="destructive"
                    leftIcon={<Icon name="plus-solid" color="current" />}
                    onClick={() => onAddUser?.(allowsExternalUsers, {name: role, title})}
                >
                    {t("add")}
                </Button>
            </div>
        );
    }

    if (!user) {
        return;
    }

    return (
        <>
            <div className="flex flex-col pb-8">
                <UserAvatar userName={user.displayName} />
                <div className="flex min-w-0 gap-2">
                    <Text fontWeight="semibold">{l(title)}</Text>
                    <div className="flex flex-row items-center gap-1">
                        {canEdit && (
                            <Button
                                intent="ghost"
                                size="small"
                                shape="circular"
                                className="ui:ml-1 ui:border-0 ui:px-1 ui:align-middle ui:hover:enabled:bg-grey-100 ui:dark:hover:enabled:bg-grey-800"
                                onClick={() =>
                                    onAddUser?.(allowsExternalUsers, {name: role, title})
                                }
                            >
                                <Icon name="edit-line" size="xs" color="danger" />
                            </Button>
                        )}
                        {canEdit && relatedUser.allowsAssignment && (
                            <Button
                                intent="ghost"
                                size="small"
                                shape="circular"
                                className="ui:ml-1 ui:border-0 ui:px-1 ui:align-middle ui:hover:enabled:bg-grey-100 ui:dark:hover:enabled:bg-grey-800"
                                onClick={() => setIsRemoving(true)}
                            >
                                <Icon name="trash-line" size="xs" color="danger" />
                            </Button>
                        )}
                    </div>
                </div>
                <Text>{user.displayName}</Text>
                {user.organization && <Text>{user.organization?.name}</Text>}
                <div className="flex flex-row items-center gap-2">
                    <Icon className="flex-none" name="email-line" color="current" size="md" />
                    <Link underline className="truncate" href={`mailto:${user.email}`}>
                        {user.email}
                    </Link>
                    {isEmailEditable && user.requiresInvitation == true && (
                        <Button
                            intent="ghost"
                            size="small"
                            shape="circular"
                            className="ui:ml-1 ui:border-0 ui:px-1 ui:align-middle ui:hover:enabled:bg-grey-100 ui:dark:hover:enabled:bg-grey-800"
                            onClick={() => setIsEditing(true)}
                            aria-label={t("instance.summary.edit_answer")}
                        >
                            <Icon name="edit-line" size="xs" color="danger" />
                        </Button>
                    )}
                </div>
            </div>
            {isEditing && (
                <EditEmailModal
                    isOpen={isEditing}
                    setIsOpen={setIsEditing}
                    user={user}
                    onSave={handleSave}
                    isSaving={isUpdatingEmail}
                />
            )}
            {isRemoving && (
                <RemoveStaffMemberModal
                    isOpen={isRemoving}
                    setIsOpen={setIsRemoving}
                    onConfirm={handleRemoveUser}
                    user={user}
                />
            )}
        </>
    );
}
