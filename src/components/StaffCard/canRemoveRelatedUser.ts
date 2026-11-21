import type {RelatedUserRoles} from "~/store/api/types/instances.ts";

export function canRemoveRelatedUser(
    role: Pick<RelatedUserRoles, "canEdit" | "allowsAssignment" | "users">,
) {
    return role.canEdit && (role.allowsAssignment || role.users.length > 1);
}
