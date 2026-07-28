import type {PersonalInstance, PersonalRole} from "~/store/api/types/personal";

export type PersonalRoleGroup = {
    role: PersonalRole;
    instances: PersonalInstance[];
};

export function partitionPersonalInstancesByCompletion(instances: PersonalInstance[]): {
    active: PersonalInstance[];
    completed: PersonalInstance[];
} {
    return {
        active: instances.filter((instance) => instance.currentStep !== null),
        completed: instances.filter((instance) => instance.currentStep === null),
    };
}

export function groupPersonalInstancesByRole(
    instances: PersonalInstance[],
    roles: PersonalRole[],
): PersonalRoleGroup[] {
    const rolesByName = new Map(roles.map((role) => [role.name, role]));
    const groupsByRole = new Map<string, PersonalRoleGroup>();

    for (const instance of instances) {
        for (const roleName of instance.roles) {
            const group = groupsByRole.get(roleName);
            if (group) {
                group.instances.push(instance);
            } else {
                const role = rolesByName.get(roleName);
                if (role) {
                    groupsByRole.set(roleName, {role, instances: [instance]});
                }
            }
        }
    }

    return [...groupsByRole.values()].sort((first, second) =>
        first.role.name.localeCompare(second.role.name),
    );
}
