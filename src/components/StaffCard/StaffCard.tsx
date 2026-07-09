import {useState} from "react";

import {Button, Disclosure, Heading, Icon, Link, Text} from "@uva-fnwi/datanose-ui";

import AddStaffModal from "~/components/instance/AddStaffModal.tsx";
import {RelatedStaffInfo} from "~/components/StaffCard/RelatedStaffInfo.tsx";
import {useTranslate} from "~/hooks/useTranslate.ts";
import {instancesEndpoints} from "~/store/api/instancesApi.ts";
import type {RelatedUserGroup} from "~/store/api/types/instances.ts";

type StaffCardProps = {
    instanceId: string;
    relatedUserGroups: RelatedUserGroup[];
    canEdit?: boolean;
};

export function StaffCard({instanceId, relatedUserGroups, canEdit = false}: StaffCardProps) {
    const {t, l} = useTranslate("workflow");
    const [isAddStaffModalOpen, setIsAddStaffModalOpen] = useState(false);

    const {data: instance} = instancesEndpoints.getInstance.useQuery(instanceId ?? "", {
        skip: !instanceId,
    });

    return (
        <>
            <Disclosure>
                <Disclosure.Header>
                    <div className="flex flex-row items-center justify-between">
                        <Heading size="sm">{t("staff_card.title")}</Heading>
                        <Button
                            intent="secondary"
                            variant="destructive"
                            size="square"
                            width="none"
                            className="flex items-center justify-center leading-0"
                            onClick={(e) => {
                                e.stopPropagation();
                                setIsAddStaffModalOpen(true);
                            }}
                        >
                            <Icon name="plus-solid" color="current" />
                        </Button>
                    </div>
                </Disclosure.Header>
                <Disclosure.Content padding="lg" className="flex flex-col gap-4">
                    {relatedUserGroups.length > 0 &&
                        relatedUserGroups.map((group, group_index) => (
                            <div key={`related_${group_index}`}>
                                <Heading size="sm" className="mb-4 empty:hidden">
                                    {l(group.title)}
                                </Heading>
                                {group.users.map((relatedUser, user_index) => (
                                    <RelatedStaffInfo
                                        key={`related_${group_index}_${user_index}`}
                                        instanceId={instanceId}
                                        relatedUser={relatedUser}
                                        isEditable={
                                            canEdit &&
                                            relatedUser.user.isExternal &&
                                            relatedUser.user.requiresInvitation === true
                                        }
                                    />
                                ))}
                            </div>
                        ))}

                    <div className="flex flex-row items-center gap-1">
                        <Text fontWeight="semibold">{t("staff_card.confidential_advisers")}</Text>
                        <Icon name="square-info-line" />
                    </div>
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
                </Disclosure.Content>
            </Disclosure>
            <AddStaffModal
                isOpen={isAddStaffModalOpen}
                onOpenChange={() => setIsAddStaffModalOpen(!isAddStaffModalOpen)}
                onConfirm={() => console.log("Do something")}
                instanceFields={instance?.fields}
                allowsExternalUsers={true}
            />
        </>
    );
}
