import {useState} from "react";

import {useParams} from "react-router";

import {Button, Card, Heading, Icon, Select, SelectItem, Skeleton} from "@uva-fnwi/datanose-ui";

import {useTranslate} from "~/hooks/useTranslate";
import {instancesEndpoints} from "~/store/api/instancesApi";
import {submissionsEndpoints} from "~/store/api/submissionsApi.ts";
import type {ImpersonationRole} from "~/store/api/types/submissions";
import {clearRoleImpersonation, selectRoleImpersonationForInstance} from "~/store/authSlice";
import {useAppDispatch, useAppSelector} from "~/store/store";

type AdminCardProps = {
    instanceId: string;
    canUseAdminTools: boolean;
    submissionId?: string;
};

export function AdminCard({instanceId, canUseAdminTools, submissionId}: AdminCardProps) {
    const {id} = useParams<{id: string}>();
    const {t, l} = useTranslate("workflow");
    const impersonate = useAppSelector((state) => selectRoleImpersonationForInstance(state, id));
    const dispatch = useAppDispatch();
    const [selectedRole, setSelectedRole] = useState<ImpersonationRole | null>(
        impersonate?.role ?? null,
    );
    const {data: impersonationRoles, isLoading} = instancesEndpoints.getImpersonationRoles.useQuery(
        id ?? "",
        {
            skip: !id,
        },
    );

    const [impersonateRole] = instancesEndpoints.impersonateRole.useMutation();
    const [fillDummyData] = submissionsEndpoints.getFakeSubmissionData.useMutation();

    if (isLoading) {
        return (
            <Card>
                <div className="flex flex-col gap-4">
                    <Skeleton className="h-10 w-full" />
                </div>
            </Card>
        );
    }

    return (
        <Card>
            <div className="flex flex-col gap-4">
                <Heading as="h3" size="sm">
                    {t("admin.title")}
                </Heading>
                <Heading as="h4" size="xs">
                    {t("admin.impersonate_role_title")}
                </Heading>
                <Select
                    placeholder={t("admin.impersonate_role_placeholder")}
                    value={selectedRole?.name}
                    onChange={(value) =>
                        setSelectedRole(
                            impersonationRoles?.find((role) => role.name === value) ?? null,
                        )
                    }
                >
                    {impersonationRoles?.map((role) => (
                        <SelectItem key={role.name} title={l(role.title)}>
                            {l(role.title)}
                        </SelectItem>
                    )) ?? []}
                </Select>
                <div className="flex w-full flex-col gap-2 md:flex-row">
                    <Button
                        onClick={() =>
                            impersonateRole({
                                instanceId: id ?? "",
                                roleName: selectedRole?.name ?? "",
                            })
                        }
                        disabled={
                            !selectedRole ||
                            isLoading ||
                            selectedRole?.name === impersonate?.role?.name
                        }
                        intent="primary"
                        leftIcon={<Icon name="user-line" size="sm" color="current" />}
                        className="flex-1"
                    >
                        {t("admin.impersonate_role_button")}
                    </Button>
                    {impersonate !== null && (
                        <Button
                            intent="secondary"
                            variant="destructive"
                            onClick={() => {
                                dispatch(clearRoleImpersonation());
                                window.location.reload();
                            }}
                            leftIcon={<Icon name="cross-small-line" size="sm" color="current" />}
                            className="flex-1"
                        >
                            {t("admin.stop_impersonating_button")}
                        </Button>
                    )}
                </div>
                {canUseAdminTools && !!submissionId && (
                    <Button
                        intent="secondary"
                        variant="default"
                        onClick={() => fillDummyData({instanceId, submissionId})}
                        leftIcon={<Icon name="sparkles-line" size="sm" color="current" />}
                    >
                        {t("admin.fill_dummy_data_button")}
                    </Button>
                )}
            </div>
        </Card>
    );
}
