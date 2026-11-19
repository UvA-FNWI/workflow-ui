import {useLocation} from "react-router";

import {Icon} from "@uva-fnwi/datanose-ui";

import {HomeListLink} from "~/components/Home/HomeListLink";
import type {UserDto} from "~/store/api/types/users";

export function UserLink({user}: {user: UserDto}) {
    const {pathname, search} = useLocation();

    return (
        <HomeListLink
            to={`/personal/${encodeURIComponent(user.id)}`}
            state={{from: {pathname, search}}}
            title={user.displayName}
            subtitle={[user.email, user.userName].filter(Boolean).join(" · ")}
            icon={<Icon name="user-line" color="current" decorative />}
            iconClassName="bg-green-100 text-black"
        />
    );
}
