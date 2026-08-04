import type {ReactNode} from "react";

import {Button, Icon, Link, Text, Tooltip} from "@uva-fnwi/datanose-ui";

import {useTranslate} from "~/hooks/useTranslate.ts";
import type {UserSearchResult} from "~/store/api/types/users.ts";

type UserInfoDisplayProps = {
    user: UserSearchResult;
    canEditEmail?: boolean;
    onEditEmail?: (user: UserSearchResult) => void;
    actionButton?: ReactNode;
};

export function UserInfoDisplay({
    user,
    canEditEmail = false,
    onEditEmail,
    actionButton,
}: UserInfoDisplayProps) {
    const {t} = useTranslate("workflow");

    return (
        <>
            <div className="flex flex-row items-center gap-2">
                <Text className="wrap-anywhere">{user.displayName}</Text>
                {actionButton}
            </div>
            {user.organization && <Text className="wrap-anywhere">{user.organization?.name}</Text>}
            <div className="flex flex-row items-center gap-1">
                <div className="flex min-w-0 flex-row items-center gap-2 overflow-hidden">
                    <Icon className="flex-none" name="email-line" color="current" size="md" />

                    <Tooltip content={user.email} triggerClassName="min-w-0 overflow-hidden">
                        <Link
                            underline
                            className="block max-w-full truncate"
                            href={`mailto:${user.email}`}
                        >
                            {user.email}
                        </Link>
                    </Tooltip>
                </div>
                {canEditEmail && (
                    <Button
                        intent="ghost"
                        size="small"
                        shape="circular"
                        className="ui:ml-1 ui:border-0 ui:px-1 ui:align-middle ui:hover:enabled:bg-grey-100 ui:dark:hover:enabled:bg-grey-800"
                        onClick={() => (onEditEmail ? onEditEmail(user) : undefined)}
                        aria-label={t("instance.summary.edit_answer")}
                    >
                        <Icon name="edit-line" size="xs" color="danger" />
                    </Button>
                )}
            </div>
        </>
    );
}
