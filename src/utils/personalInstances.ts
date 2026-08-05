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
    const groupsByRole = new Map<string, PersonalRoleGroup>(
        roles.map((role) => [role.name.toLowerCase(), {role, instances: []}]),
    );

    for (const instance of instances) {
        for (const roleName of instance.roles) {
            const group = groupsByRole.get(roleName.toLowerCase());
            if (group) {
                group.instances.push(instance);
            }
        }
    }

    return [...groupsByRole.values()].filter((group) => group.instances.length > 0);
}
