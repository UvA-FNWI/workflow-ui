import type {PersonalInstance} from "~/store/api/types/personal";

export type PersonalRoleGroup = {
    role: string;
    instances: PersonalInstance[];
};

export function groupPersonalInstancesByRole(instances: PersonalInstance[]): PersonalRoleGroup[] {
    const instancesByRole = new Map<string, PersonalInstance[]>();

    for (const instance of instances) {
        for (const role of instance.roles) {
            const roleInstances = instancesByRole.get(role) ?? [];
            roleInstances.push(instance);
            instancesByRole.set(role, roleInstances);
        }
    }

    return [...instancesByRole.entries()]
        .sort(([firstRole], [secondRole]) => firstRole.localeCompare(secondRole))
        .map(([role, roleInstances]) => ({role, instances: roleInstances}));
}
