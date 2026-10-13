import {Text, Tooltip} from "@uva-fnwi/datanose-ui";

import {useTranslate} from "~/hooks/useTranslate.ts";
import type {ScreenRelatedUser} from "~/store/api/types/screens.ts";

export function TableStaffCell({users}: {users: ScreenRelatedUser[]}) {
    return (
        <div className="flex flex-col">
            {users.map((user) => (
                <Tooltip
                    key={user.displayName}
                    triggerClassName="self-start max-w-full"
                    content={<UserTooltip user={user} />}
                >
                    <Text display="block" size="sm" className="max-w-80 truncate">
                        {user.displayName}
                    </Text>
                </Tooltip>
            ))}
        </div>
    );
}

function UserTooltip({user}: {user: ScreenRelatedUser}) {
    const {l, t} = useTranslate();

    const roleLabels = user.roles.map((role) => l(role)).join(", ");

    return (
        <div className="max-w-72 space-y-3 text-left">
            <div className="space-y-1">
                <div className="text-sm font-semibold">{user.displayName}</div>

                {user.organisation && <div className="text-xs opacity-75">{user.organisation}</div>}
            </div>

            {user.roles.length > 0 && (
                <div className="space-y-1">
                    <div className="text-xs font-medium opacity-75">{t("Roles")}</div>
                    <div className="text-xs">{roleLabels}</div>
                </div>
            )}
        </div>
    );
}
