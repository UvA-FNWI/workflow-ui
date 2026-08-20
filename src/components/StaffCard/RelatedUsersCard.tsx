import {useMemo, useState} from "react";

import {Button, Disclosure, Heading, Icon, Link, Text} from "@uva-fnwi/datanose-ui";

import AddStaffModal from "~/components/StaffCard/AddStaffModal.tsx";
import {RelatedStaffInfo} from "~/components/StaffCard/RelatedStaffInfo.tsx";
import {useTranslate} from "~/hooks/useTranslate.ts";
import type {LocalString} from "~/hooks/useTranslate.ts";
import {instancesEndpoints} from "~/store/api/instancesApi.ts";
import type {InfoCardItem, RelatedUserGroup, Role} from "~/store/api/types/instances.ts";
import type {CreateExternalUserInput, UserSearchResult} from "~/store/api/types/users.ts";

type RelatedUsersCardProps = {
    instanceId: string;
    title: LocalString;
    relatedUserGroups: RelatedUserGroup[];
    items?: InfoCardItem[] | null;
};

export function RelatedUsersCard({
    instanceId,
    title,
    relatedUserGroups,
    items,
}: RelatedUsersCardProps) {
    const {l} = useTranslate("workflow");
    const [isAddStaffModalOpen, setIsAddStaffModalOpen] = useState(false);
    const [addStaffModalData, setAddStaffModalData] = useState<{
        allowsExternalUsers: boolean;
        initialRole?: Role;
        disableRoleSelection?: boolean;
    }>({allowsExternalUsers: false});

    const [assignRelatedUser] = instancesEndpoints.assignRelatedUser.useMutation();

    const instanceUserRoles: Role[] = useMemo(() => {
        return relatedUserGroups.flatMap((group) =>
            group.userRoles
                .filter((role) => role.canEdit)
                .map((role) => ({name: role.role, title: role.title})),
        );
    }, [relatedUserGroups]);

    const handleOpenAddStaffModal = (
        allowsExternalUsers: boolean,
        role?: Role,
        disableRoleSelection?: boolean,
    ) => {
        setAddStaffModalData({
            allowsExternalUsers,
            initialRole: role,
            disableRoleSelection: disableRoleSelection,
        });
        setIsAddStaffModalOpen(true);
    };

    const handleAddStaff = async (
        role: Role,
        value: UserSearchResult[],
        externalUser?: CreateExternalUserInput | null,
    ) => {
        if (!value[0]) return;

        assignRelatedUser({
            instanceId,
            property: role.name,
            user: value[0],
            externalUser: externalUser ? externalUser : undefined,
        });
        setIsAddStaffModalOpen(false);
        setAddStaffModalData({
            allowsExternalUsers: false,
            initialRole: undefined,
            disableRoleSelection: false,
        });
    };

    return (
        <>
            <Disclosure>
                <div className="flex flex-row items-center justify-between">
                    <Disclosure.Header>
                        <Heading size="sm">{l(title)}</Heading>
                    </Disclosure.Header>
                    {instanceUserRoles.length > 0 && (
                        <div className="pr-6">
                            <Button
                                intent="secondary"
                                variant="destructive"
                                size="square"
                                width="none"
                                className="flex items-center justify-center leading-0"
                                onClick={() => handleOpenAddStaffModal(false, undefined)}
                            >
                                <Icon name="plus-solid" color="current" />
                            </Button>
                        </div>
                    )}
                </div>
                <Disclosure.Content padding="lg" className="flex flex-col gap-4">
                    {relatedUserGroups.length > 0 &&
                        relatedUserGroups.map((group, group_index) => (
                            <div key={`related_${group_index}`}>
                                <Heading size="sm" className="mb-4 empty:hidden">
                                    {l(group.title)}
                                </Heading>
                                {group.userRoles.map((relatedUserRoles, user_role_index) => (
                                    <RelatedStaffInfo
                                        key={`related_${group_index}_${user_role_index}`}
                                        instanceId={instanceId}
                                        relatedUserRoles={relatedUserRoles}
                                        onAddUser={handleOpenAddStaffModal}
                                        canEdit={relatedUserRoles.canEdit}
                                    />
                                ))}
                            </div>
                        ))}
                    {(items ?? []).map((item) => {
                        const url = l(item.url);
                        if (!url) return null;
                        return (
                            <div key={item.name} className="flex flex-col gap-1">
                                <Text fontWeight="semibold">{l(item.text)}</Text>
                                <Link
                                    underline
                                    className="break-all"
                                    href={url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                >
                                    {url.replace(/^https?:\/\//, "")}
                                </Link>
                            </div>
                        );
                    })}
                </Disclosure.Content>
            </Disclosure>
            <AddStaffModal
                isOpen={isAddStaffModalOpen}
                onOpenChange={() => setIsAddStaffModalOpen(!isAddStaffModalOpen)}
                onConfirm={handleAddStaff}
                allowsExternalUsers={addStaffModalData.allowsExternalUsers}
                instanceRoles={instanceUserRoles}
                initialRole={addStaffModalData.initialRole}
                disableRoleSelection={addStaffModalData.disableRoleSelection}
                relatedUserGroups={relatedUserGroups}
            />
        </>
    );
}
