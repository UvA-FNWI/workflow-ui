import {Button, Disclosure, Heading, Icon, Link, Text, Tooltip} from "@uva-fnwi/datanose-ui";

import {UserAvatar} from "~/components/instance/UserAvatar.tsx";
import {useTranslate} from "~/hooks/useTranslate.ts";
import type {RelatedUser, RelatedUserGroup} from "~/store/api/types/instances.ts";

type StaffCardProps = {
    relatedUserGroups: RelatedUserGroup[];
};

export function StaffCard({relatedUserGroups}: StaffCardProps) {
    const {t, l} = useTranslate("workflow");

    if (relatedUserGroups.length === 0) return;

    return (
        <Disclosure>
            <Disclosure.Header>
                <div className="flex w-full items-center justify-start gap-2">
                    <Heading>{t("staff_card.title")}</Heading>
                    <Button intent="secondary" variant="destructive" size="square" width="none">
                        <Icon name="plus-solid" color="current" size="sm" className="block" />
                    </Button>
                </div>
            </Disclosure.Header>
            <Disclosure.Content>
                {relatedUserGroups.map((group, group_index) => (
                    <div key={group_index}>
                        <Heading size="sm" className="mt-4">
                            {l(group.title)}
                        </Heading>
                        {group.users.map((relatedUser, user_index) => (
                            <RelatedStaffInfo key={user_index} {...relatedUser} />
                        ))}
                    </div>
                ))}

                <div className="flex flex-row items-center gap-1">
                    <Text fontWeight="semibold">{t("staff_card.confidential_advisers")}</Text>
                    <Tooltip
                        content={
                            <Text
                                size="sm"
                                color="white"
                                className="inline-flex text-center text-wrap"
                            >
                                {t("staff_card.info_tooltip")}
                            </Text>
                        }
                        className="w-50 overflow-visible"
                    >
                        <Icon name="square-info-line" className="cursor-pointer" />
                    </Tooltip>
                </div>
                <Link
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

function RelatedStaffInfo({title, user}: RelatedUser) {
    const {l} = useTranslate("workflow");
    return (
        <div className="flex flex-col py-4">
            <UserAvatar userName={user.displayName} />
            <Text fontWeight="semibold">{l(title)}</Text>
            <Text>{user.displayName}</Text>
            {user.organization && <Text>{user.organization?.name}</Text>}
            <div className="flex flex-row items-end gap-2">
                <Icon name="email-line" color="current" size="md" />
                <Link underline className="truncate" href={`mailto:${user.email}`}>
                    {user.email}
                </Link>
            </div>
        </div>
    );
}
