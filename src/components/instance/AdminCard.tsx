import {useState} from "react";

import {useParams} from "react-router";

import {
    Button,
    Card,
    Heading,
    Icon,
    Select,
    SelectItem,
    Separator,
    Skeleton,
    Text,
} from "@uva-fnwi/datanose-ui";

import {useTranslate} from "~/hooks/useTranslate";
import {instancesEndpoints} from "~/store/api/instancesApi";
import {submissionsEndpoints} from "~/store/api/submissionsApi.ts";
import type {Role} from "~/store/api/types/instances.ts";
import {clearRoleImpersonation, selectRoleImpersonationForInstance} from "~/store/authSlice";
import {useAppDispatch, useAppSelector} from "~/store/store";

export function AdminCard() {
    const {id} = useParams<{id: string}>();
    const {t, l} = useTranslate("workflow");
    const impersonate = useAppSelector((state) => selectRoleImpersonationForInstance(state, id));
    const {formId: openFormId, instanceId} = useAppSelector((state) => state.openForm);
    const dispatch = useAppDispatch();
    const [selectedRole, setSelectedRole] = useState<Role | null>(impersonate?.role ?? null);
    const {data: impersonationRoles, isLoading} = instancesEndpoints.getImpersonationRoles.useQuery(
        id ?? "",
        {
            skip: !id,
        },
    );

    const {data: activeSteps, isLoading: isLoadingActions} =
        instancesEndpoints.getImpersonationActions.useQuery(id ?? "", {skip: !id});

    const [impersonateRole] = instancesEndpoints.impersonateRole.useMutation();
    const [generateDummyData] = submissionsEndpoints.generateDummySubmissionData.useMutation();

    const currentStep = activeSteps?.find((step) => step.isCurrent);
    // Active parent and child steps may carry actions even when the current step does not.
    const stepsWithActions = activeSteps?.filter((step) => step.roles.length > 0) ?? [];

    if (isLoading || isLoadingActions) {
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
                {!!instanceId && !!openFormId && (
                    <Button
                        intent="secondary"
                        variant="default"
                        onClick={() => generateDummyData({instanceId, submissionId: openFormId})}
                        leftIcon={<Icon name="sparkles-line" size="sm" color="current" />}
                    >
                        {t("admin.fill_dummy_data_button")}
                    </Button>
                )}
                <Separator />
                <div className="flex flex-col gap-3">
                    <Heading as="h4" size="xs">
                        {t("admin.current_step_title")}
                    </Heading>
                    {currentStep ? (
                        <StepName title={l(currentStep.title)} name={currentStep.name} />
                    ) : (
                        <Text size="sm" intent="secondary">
                            {t("admin.no_current_step")}
                        </Text>
                    )}
                    <Heading as="h4" size="xs">
                        {t("admin.who_can_act_title")}
                    </Heading>
                    {stepsWithActions.length === 0 ? (
                        <Text size="sm" intent="secondary">
                            {t("admin.no_actions")}
                        </Text>
                    ) : (
                        stepsWithActions.map((step) => (
                            <div key={step.name} className="flex flex-col gap-1">
                                <StepName title={l(step.title)} name={step.name} />
                                <ul className="flex flex-col gap-1 pl-2">
                                    {step.roles.map((role) => {
                                        // Different action definitions can produce the same label.
                                        const labels = new Set(
                                            role.actions.map((a) =>
                                                a.label
                                                    ? l(a.label)
                                                    : a.target
                                                      ? `${a.type} ${a.target}`
                                                      : a.type,
                                            ),
                                        );
                                        return (
                                            <li key={role.name}>
                                                <Text as="span" size="sm">
                                                    {l(role.title)}
                                                </Text>
                                                <Text as="span" size="sm" intent="secondary">
                                                    {" · "}
                                                    {[...labels].join(" · ")}
                                                </Text>
                                            </li>
                                        );
                                    })}
                                </ul>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </Card>
    );
}

function StepName({title, name}: {title?: string; name: string}) {
    return (
        <Text as="span" size="sm" fontWeight="semibold">
            {title}{" "}
            <Text as="span" size="xs" intent="secondary" className="font-mono">
                {name}
            </Text>
        </Text>
    );
}
