import {Disclosure, Heading, Icon, Link, Text} from "@uva-fnwi/datanose-ui";

import {RelatedStaffInfo} from "~/components/StaffCard/RelatedStaffInfo.tsx";
import {useTranslate} from "~/hooks/useTranslate.ts";
import type {RelatedUserGroup} from "~/store/api/types/instances.ts";

type StaffCardProps = {
    relatedUserGroups: RelatedUserGroup[];
    canEdit?: boolean;
};

export function StaffCard({relatedUserGroups, canEdit = false}: StaffCardProps) {
    const {t, l} = useTranslate("workflow");

    return (
        <Disclosure>
            <Disclosure.Header>
                <Heading>{t("staff_card.title")}</Heading>
            </Disclosure.Header>
            <Disclosure.Content>
                {relatedUserGroups.length > 0 &&
                    relatedUserGroups.map((group, group_index) => (
                        <div key={group_index}>
                            <Heading size="sm" className="my-4">
                                {l(group.title)}
                            </Heading>
                            {group.users.map((relatedUser, user_index) => (
                                <RelatedStaffInfo
                                    key={user_index}
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
                    className="break-all"
                    underline
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
    );
}
