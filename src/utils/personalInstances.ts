import type {PersonalInstance, PersonalRole} from "~/store/api/types/personal";

export type PersonalRoleGroup = {
    role: PersonalRole;
    instances: PersonalInstance[];
};

export function partitionPersonalInstancesByStatus(instances: PersonalInstance[]) {
    const active: PersonalInstance[] = [];
    const completed: PersonalInstance[] = [];
    const stopped: PersonalInstance[] = [];

    for (const instance of instances) {
        if (instance.workflowStopped) {
            stopped.push(instance);
        } else if (instance.currentStep === null) {
            completed.push(instance);
        } else {
            active.push(instance);
        }
    }

    return {active, completed, stopped};
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
