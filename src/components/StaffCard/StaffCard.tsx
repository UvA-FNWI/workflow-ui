import {useMemo, useState} from "react";

import {Button, Disclosure, Heading, Icon, Link, Text} from "@uva-fnwi/datanose-ui";

import AddStaffModal from "~/components/StaffCard/AddStaffModal.tsx";
import {RelatedStaffInfo} from "~/components/StaffCard/RelatedStaffInfo.tsx";
import {useTranslate} from "~/hooks/useTranslate.ts";
import {instancesEndpoints} from "~/store/api/instancesApi.ts";
import type {RelatedUserGroup, Role} from "~/store/api/types/instances.ts";
import type {CreateExternalUserInput, UserSearchResult} from "~/store/api/types/users.ts";

type StaffCardProps = {
    instanceId: string;
    relatedUserGroups: RelatedUserGroup[];
    canEdit?: boolean;
};

export function StaffCard({instanceId, relatedUserGroups, canEdit = false}: StaffCardProps) {
    const {t, l} = useTranslate("workflow");
    const [isAddStaffModalOpen, setIsAddStaffModalOpen] = useState(false);
    const [addStaffModalData, setAddStaffModalData] = useState<{
        allowsExternalUsers: boolean;
        initialRole?: Role;
        disableRoleSelection?: boolean;
    }>({allowsExternalUsers: false});

    const {data: instance} = instancesEndpoints.getInstance.useQuery(instanceId ?? "", {
        skip: !instanceId,
    });

    const [updateProperty] = instancesEndpoints.updateProperty.useMutation();

    const instanceUserRoles: Role[] = useMemo(() => {
        return (
            instance?.relatedUserGroups.groups?.flatMap(
                (g) =>
                    g.userRoles
                        .filter((u) => u.canEdit)
                        .map((u) => ({
                            name: u.role,
                            title: u.title,
                        })) ?? [],
            ) ?? []
        );
    }, [instance]);

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
        updateProperty({
            instanceId,
            property: role.name,
            value: value.length === 1 ? value[0] : value,
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
                        <Heading size="sm">{t("staff_card.title")}</Heading>
                    </Disclosure.Header>
                    {canEdit && (
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
                                        canEdit={
                                            relatedUserRoles.canEdit && group.name === "default"
                                        }
                                    />
                                ))}
                            </div>
                        ))}

                    <div className="flex flex-col gap-1">
                        <Text fontWeight="semibold">{t("staff_card.confidential_advisers")}</Text>
                        <Link
                            underline
                            className="break-all"
                            href={
                                t("staff_card.confidential_advisers_link").startsWith("http")
                                    ? t("staff_card.confidential_advisers_link")
                                    : `https://${t("staff_card.confidential_advisers_link")}`
                            }
                            target="_blank"
                            rel="noopener noreferrer"
                        >
                            {t("staff_card.confidential_advisers_link")}
                        </Link>
                    </div>
                </Disclosure.Content>
            </Disclosure>
            <AddStaffModal
                isOpen={isAddStaffModalOpen}
                onOpenChange={() => setIsAddStaffModalOpen(!isAddStaffModalOpen)}
                onConfirm={handleAddStaff}
                instanceFields={instance?.fields}
                allowsExternalUsers={addStaffModalData.allowsExternalUsers}
                instanceRoles={instanceUserRoles}
                initialRole={addStaffModalData.initialRole}
                disableRoleSelection={addStaffModalData.disableRoleSelection}
            />
        </>
    );
}
