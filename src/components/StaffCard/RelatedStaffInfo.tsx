import {useState} from "react";

import {Button, Icon, Link, Text} from "@uva-fnwi/datanose-ui";

import {UserAvatar} from "~/components/instance/UserAvatar.tsx";
import {EditEmailModal} from "~/components/StaffCard/EditEmailModal.tsx";
import {useTranslate} from "~/hooks/useTranslate.ts";
import type {RelatedUser} from "~/store/api/types/instances.ts";

type RelatedStaffInfoProps = {
    relatedUser: RelatedUser;
    isEditable?: boolean;
};

export function RelatedStaffInfo({relatedUser, isEditable}: RelatedStaffInfoProps) {
    const {t, l} = useTranslate("workflow");
    const {user, title} = relatedUser;
    const [isEditing, setIsEditing] = useState(false);

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
                <div className="flex flex-row items-end gap-2">
                    <Icon name="email-line" color="current" size="md" />
                    <Link underline className="truncate" href={`mailto:${user.email}`}>
                        {user.email}
                    </Link>
                </div>
            </div>
            <EditEmailModal
                isOpen={isEditing}
                setIsOpen={setIsEditing}
                user={user}
                onSave={() => {}}
            />
        </>
    );
}
