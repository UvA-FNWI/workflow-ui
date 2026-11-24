import {useLocation} from "react-router";

import {HomeListLink} from "~/components/Home/HomeListLink";
import {UserAvatar} from "~/components/instance/UserAvatar";
import type {UserDto} from "~/store/api/types/users";

export function UserLink({user}: {user: UserDto}) {
    const {pathname, search} = useLocation();
    const subtitle = [user.organization?.name?.trim(), user.userName?.trim(), user.email?.trim()]
        .filter(Boolean)
        .join(" - ");

    return (
        <HomeListLink
            to={`/personal/${encodeURIComponent(user.id)}`}
            state={{from: {pathname, search}}}
            title={user.displayName}
            subtitle={subtitle}
            icon={
                <UserAvatar
                    userName={user.displayName}
                    picture={user.picture ?? undefined}
                    size="small"
                    className="h-full w-full bg-forest-200 text-black"
                />
            }
        />
    );
}
