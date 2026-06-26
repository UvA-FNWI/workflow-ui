import {useState} from "react";

import {useParams} from "react-router";

import {Button, Icon, Link, Text} from "@uva-fnwi/datanose-ui";

import {UserAvatar} from "~/components/instance/UserAvatar.tsx";
import {EditEmailModal} from "~/components/StaffCard/EditEmailModal.tsx";
import {useTranslate} from "~/hooks/useTranslate.ts";
import {baseApi} from "~/store/api/baseApi.ts";
import type {RelatedUser} from "~/store/api/types/instances.ts";
import type {UserSearchResult} from "~/store/api/types/users.ts";
import {useUpdateUserEmailMutation} from "~/store/api/usersApi.ts";
import {useAppDispatch} from "~/store/store.ts";

type RelatedStaffInfoProps = {
    relatedUser: RelatedUser;
    isEditable?: boolean;
};

export function RelatedStaffInfo({relatedUser, isEditable = false}: RelatedStaffInfoProps) {
    const {id: instanceId} = useParams<{id: string}>();
    const {t, l} = useTranslate("workflow");
    const {user, title} = relatedUser;
    const [isEditing, setIsEditing] = useState(false);
    const [updateUserEmail] = useUpdateUserEmailMutation();
    const dispatch = useAppDispatch();

    const handleSave = async (updatedUser: UserSearchResult) => {
        if (!user.id) {
            return;
        }

        await updateUserEmail({
            userId: user.id,
            email: updatedUser.email,
        }).unwrap();

        if (instanceId) {
            dispatch(baseApi.util.invalidateTags([{type: "Instance", id: instanceId}]));
        }
    };

    return (
        <>
            <div className="flex flex-col pb-8">
                <UserAvatar userName={user.displayName} />
                <div className="flex min-w-0 gap-2">
                    <Text fontWeight="semibold">{l(title)}</Text>
                    {isEditable && (
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
                <Text>{user.displayName}</Text>
                {user.organization && <Text>{user.organization?.name}</Text>}
                <div className="flex flex-row items-center gap-2">
                    <Icon className="flex-none" name="email-line" color="current" size="md" />
                    <Link underline className="truncate" href={`mailto:${user.email}`}>
                        {user.email}
                    </Link>
                </div>
            </div>
            <EditEmailModal
                isOpen={isEditing}
                setIsOpen={setIsEditing}
                user={user}
                onSave={handleSave}
            />
        </>
    );
}
