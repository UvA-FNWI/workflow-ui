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
    const {l} = useTranslate("screens");

    const roleLabels = user.roles.map((role) => l(role)).join(", ");

    return (
        <span className="flex flex-row gap-1">
            <span className="text-xs">{user.displayName}</span>
            {user.organisation && <span className="text-xs">{user.organisation}</span>}
            {user.roles.length > 0 && <span className="text-xs">{`(${roleLabels})`}</span>}
        </span>
    );
}
