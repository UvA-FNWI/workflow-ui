import {Button, Disclosure, Heading, Icon, Link, Text, Tooltip} from "@uva-fnwi/datanose-ui";

import {useTranslate} from "~/hooks/useTranslate.ts";
import type {StaffMember} from "~/store/api/types/instances.ts";

export function StaffCard() {
    const {t} = useTranslate("workflow");

    const dummyStaff: StaffMember[] = [
        {
            type: "primary",
            role: {en: "Supervisor", nl: "Begeleider"},
            user: {
                userName: "john.doe",
                displayName: "John Doe",
                email: "john.doe@example.com",
                isExternal: true,
                organization: {
                    id: "test",
                    name: "Test Organization",
                },
            },
        },
        {
            type: "primary",
            role: {en: "Examiner", nl: "Examinator"},
            user: {
                userName: "jane.smith",
                displayName: "Jane Smith",
                email: "jane.smith@example.com",
                isExternal: false,
            },
        },
        {
            type: "support",
            role: {en: "Thesis Coordinator", nl: "Scriptiecoördinator"},
            user: {
                userName: "michael.brown",
                displayName: "Michael Brown",
                email: "michael.brown@example.com",
                isExternal: false,
            },
        },
        {
            type: "support",
            role: {en: "Study Advisor", nl: "Studieadviseur"},
            user: {
                userName: "emily.johnson",
                displayName: "Emily Johnson",
                email: "emily.johnson@example.com",
                isExternal: false,
            },
        },
    ];

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
                {dummyStaff
                    .filter((s) => s.type === "primary")
                    .map((staffMember, index) => (
                        <StaffMember key={index} {...staffMember} />
                    ))}
                <Heading size="sm" className="mt-4">
                    {t("staff_card.other_staff")}
                </Heading>
                {dummyStaff
                    .filter((s) => s.type === "support")
                    .map((staffMember, index) => (
                        <StaffMember key={index} {...staffMember} />
                    ))}
                <div className="flex flex-row items-center gap-1">
                    <Text fontWeight="semibold">{t("staff_card.confidential_advisers")}</Text>
                    <Tooltip content={t("staff_card.info_tooltip")}>
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

function StaffMember({user, role}: StaffMember) {
    const {l} = useTranslate("workflow");
    return (
        <div className="flex flex-col py-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gray-200">
                <span className="text-xl font-medium text-gray-600">
                    {user.displayName.charAt(0)}
                </span>
            </div>
            <Text fontWeight="semibold">{l(role)}</Text>
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
