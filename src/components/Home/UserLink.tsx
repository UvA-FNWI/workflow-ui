import {useLocation} from "react-router";

import {HomeListLink} from "~/components/Home/HomeListLink";
import {UserAvatar} from "~/components/instance/UserAvatar";
import type {UserDto} from "~/store/api/types/users";

export function UserLink({user}: {user: UserDto}) {
    const {pathname, search} = useLocation();
    const userName = user.userName?.trim() ?? "";
    const isStudentNumber = !user.isExternal && /^\d{7}$/.test(userName);
    const identifier = isStudentNumber ? userName : user.email?.trim() || userName;

    return (
        <HomeListLink
            to={`/personal/${encodeURIComponent(user.id)}`}
            state={{from: {pathname, search}}}
            title={user.displayName}
            subtitle={[user.organization?.name?.trim(), identifier].filter(Boolean).join(" - ")}
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
