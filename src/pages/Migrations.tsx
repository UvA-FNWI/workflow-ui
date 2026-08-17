import {useMemo, useState} from "react";

import {Navigate} from "react-router";

import {createColumnHelper} from "@tanstack/react-table";
import {
    Button,
    Callout,
    Card,
    Container,
    Input,
    InputLabel,
    Modal,
    Pill,
    type PillVariantProps,
    SearchInput,
    Select,
    SelectItem,
    Skeleton,
    Text,
    TextArea,
    useToast,
} from "@uva-fnwi/datanose-ui";

import {PageHeader} from "~/components/PageHeader";
import {DataTable} from "~/components/Table";
import {useDocumentTitle} from "~/hooks/useDocumentTitle";
import {useTranslate} from "~/hooks/useTranslate";
import {
    useCreatePropertyRenameMutation,
    useFinishMigrationMutation,
    useGetMigrationsQuery,
    useRevertMigrationMutation,
} from "~/store/api/migrationsApi";
import type {CreatePropertyRename, Migration, MigrationStatus} from "~/store/api/types/migrations";
import type {WorkflowDefinition} from "~/store/api/types/workflowDefinitions";
import {useGetCurrentUserQuery} from "~/store/api/usersApi";
import {useGetWorkflowDefinitionsQuery} from "~/store/api/workflowDefinitionsApi";
import {formatDate} from "~/utils/formatDate";

type ConfirmedAction = "finish" | "revert";

const columnHelper = createColumnHelper<Migration>();

const statusVariants: Record<MigrationStatus, NonNullable<PillVariantProps["variant"]>> = {
    Applying: "orange",
    ReadyToFinish: "orange",
    Finishing: "orange",
    Finished: "green",
    Reverting: "orange",
    Reverted: "grey",
    ApplyFailed: "red",
    FinishFailed: "red",
    RevertFailed: "red",
};

function Migrations() {
    const {t, i18n} = useTranslate(["workflow", "common"]);
    const toast = useToast();
    const {data: currentUser, isLoading: isUserLoading} = useGetCurrentUserQuery();
    const {data: definitions = []} = useGetWorkflowDefinitionsQuery({includeAll: true});
    const {data: migrations = [], isLoading, isError, refetch} = useGetMigrationsQuery();
    const [finishMigration, {isLoading: isFinishing}] = useFinishMigrationMutation();
    const [revertMigration, {isLoading: isReverting}] = useRevertMigrationMutation();
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [confirmation, setConfirmation] = useState<{
        migration: Migration;
        action: ConfirmedAction;
    } | null>(null);
    const [actionError, setActionError] = useState<string | null>(null);
    const [search, setSearch] = useState("");

    useDocumentTitle(t("migrations.title"));

    const columns = useMemo(
        () => [
            columnHelper.accessor("name", {
                header: t("migrations.columns.name"),
                cell: ({row, getValue}) => (
                    <div className="flex min-w-48 flex-col gap-1">
                        <span className="font-medium">{getValue()}</span>
                        {row.original.description && (
                            <span className="text-xs text-grey-600 dark:text-grey-300">
                                {row.original.description}
                            </span>
                        )}
                    </div>
                ),
            }),
            columnHelper.accessor((migration) => migration.definition.workflowDefinition, {
                id: "workflowDefinition",
                header: t("migrations.columns.workflow"),
            }),
            columnHelper.accessor(
                (migration) =>
                    `${migration.definition.oldProperty} → ${migration.definition.newProperty}`,
                {
                    id: "change",
                    header: t("migrations.columns.change"),
                },
            ),
            columnHelper.accessor("statusLabel", {
                header: t("migrations.columns.status"),
                cell: ({row, getValue}) => (
                    <div className="flex min-w-44 flex-col gap-1">
                        <Pill variant={statusVariants[row.original.status]}>{getValue()}</Pill>
                        {row.original.error && (
                            <span className="text-xs text-red-700 dark:text-red-300">
                                {row.original.error}
                            </span>
                        )}
                    </div>
                ),
            }),
            columnHelper.accessor((migration) => migration.progress.itemsUpdated, {
                id: "progress",
                header: t("migrations.columns.progress"),
                cell: ({row}) => (
                    <span>
                        {t("migrations.progress", {
                            updated: row.original.progress.itemsUpdated,
                            matched: row.original.progress.itemsMatched,
                        })}
                    </span>
                ),
            }),
            columnHelper.accessor("requestedBy", {
                header: t("migrations.columns.requested_by"),
            }),
            columnHelper.accessor("updatedAt", {
                header: t("migrations.columns.updated"),
                cell: ({getValue}) => formatDate(getValue(), i18n.language),
            }),
            columnHelper.display({
                id: "actions",
                header: t("migrations.columns.actions"),
                cell: ({row}) => {
                    const migration = row.original;
                    const canFinish = ["ReadyToFinish", "FinishFailed"].includes(migration.status);
                    const canRevert = ["ReadyToFinish", "ApplyFailed", "RevertFailed"].includes(
                        migration.status,
                    );
                    if (!canFinish && !canRevert) return "—";

                    return (
                        <div className="flex min-w-40 gap-2">
                            {canFinish && (
                                <Button
                                    intent="primary"
                                    size="small"
                                    onClick={() => setConfirmation({migration, action: "finish"})}
                                >
                                    {t("migrations.finish")}
                                </Button>
                            )}
                            {canRevert && (
                                <Button
                                    intent="secondary"
                                    variant="destructive"
                                    size="small"
                                    onClick={() => setConfirmation({migration, action: "revert"})}
                                >
                                    {t("migrations.revert")}
                                </Button>
                            )}
                        </div>
                    );
                },
                enableSorting: false,
            }),
        ],
        [i18n.language, t],
    );

    const runConfirmedAction = async () => {
        if (!confirmation) return;
        setActionError(null);
        try {
            if (confirmation.action === "finish") {
                await finishMigration(confirmation.migration.id).unwrap();
                toast.success(t("migrations.finish_success"));
            } else {
                await revertMigration(confirmation.migration.id).unwrap();
                toast.success(t("migrations.revert_success"));
            }
            setConfirmation(null);
            await refetch();
        } catch (error) {
            setActionError(apiErrorMessage(error, t("migrations.action_error")));
        }
    };

    if (isUserLoading) return null;
    if (!currentUser?.isSuperAdmin) return <Navigate to="/" replace />;

    return (
        <Container maxWidth={1280}>
            <PageHeader
                title={t("migrations.title")}
                backLabel={t("migrations.back_to_develop")}
                backTo="/develop"
                actions={
                    <Button intent="primary" onClick={() => setIsCreateOpen(true)}>
                        {t("migrations.new")}
                    </Button>
                }
            />

            <Callout type="warning" className="mb-4">
                {t("migrations.quiet_window_warning")}
            </Callout>

            <Card>
                <div className="mb-4 flex justify-end">
                    <SearchInput
                        value={search}
                        onChange={setSearch}
                        placeholder={t("search_placeholder", {ns: "common"})}
                        className="w-fit max-w-sm"
                    />
                </div>
                {isLoading ? (
                    <Skeleton className="h-64 w-full" />
                ) : isError ? (
                    <Text intent="error">{t("migrations.load_error")}</Text>
                ) : (
                    <DataTable
                        data={migrations}
                        columns={columns}
                        globalFilter={search}
                        getRowId={(migration) => migration.id}
                        initialSorting={[{id: "updatedAt", desc: true}]}
                        emptyNode={<Text intent="secondary">{t("migrations.empty")}</Text>}
                    />
                )}
            </Card>

            <CreatePropertyRenameModal
                isOpen={isCreateOpen}
                workflowDefinitions={definitions}
                onClose={() => setIsCreateOpen(false)}
                onCreated={async () => {
                    setIsCreateOpen(false);
                    toast.success(t("migrations.create_success"));
                    await refetch();
                }}
            />

            <Modal
                isOpen={confirmation !== null}
                onOpenChange={(open) => {
                    if (!open) {
                        setConfirmation(null);
                        setActionError(null);
                    }
                }}
                size="sm"
            >
                <Modal.Header>{t(`migrations.confirm_${confirmation?.action}_title`)}</Modal.Header>
                <Modal.Body className="flex flex-col gap-4">
                    <Text>
                        {t(`migrations.confirm_${confirmation?.action}`, {
                            name: confirmation?.migration.name,
                        })}
                    </Text>
                    {actionError && <Callout type="error">{actionError}</Callout>}
                </Modal.Body>
                <Modal.Footer>
                    <Button
                        intent="primary"
                        variant={confirmation?.action === "revert" ? "destructive" : "default"}
                        isLoading={isFinishing || isReverting}
                        onClick={() => void runConfirmedAction()}
                    >
                        {t("confirm", {ns: "workflow"})}
                    </Button>
                    <Button
                        intent="secondary"
                        onClick={() => {
                            setConfirmation(null);
                            setActionError(null);
                        }}
                    >
                        {t("cancel", {ns: "workflow"})}
                    </Button>
                </Modal.Footer>
            </Modal>
        </Container>
    );
}

function CreatePropertyRenameModal({
    isOpen,
    workflowDefinitions,
    onClose,
    onCreated,
}: {
    isOpen: boolean;
    workflowDefinitions: WorkflowDefinition[];
    onClose: () => void;
    onCreated: () => Promise<void>;
}) {
    const {t} = useTranslate("workflow");
    const [createMigration, {isLoading}] = useCreatePropertyRenameMutation();
    const [form, setForm] = useState<CreatePropertyRename>({
        name: "",
        workflowDefinition: "",
        oldProperty: "",
        newProperty: "",
        description: "",
    });
    const [error, setError] = useState<string | null>(null);
    const selectedDefinition = workflowDefinitions.find(
        (definition) => definition.name === form.workflowDefinition,
    );

    const update = (field: keyof CreatePropertyRename, value: string) =>
        setForm((current) => ({...current, [field]: value}));

    const close = () => {
        if (isLoading) return;
        setError(null);
        onClose();
    };

    const create = async () => {
        setError(null);
        try {
            await createMigration({
                ...form,
                name: form.name.trim(),
                workflowDefinition: form.workflowDefinition.trim(),
                oldProperty: form.oldProperty.trim(),
                newProperty: form.newProperty.trim(),
                description: form.description?.trim() || undefined,
            }).unwrap();
            setForm({
                name: "",
                workflowDefinition: "",
                oldProperty: "",
                newProperty: "",
                description: "",
            });
            await onCreated();
        } catch (requestError) {
            setError(apiErrorMessage(requestError, t("migrations.create_error")));
        }
    };

    const isComplete =
        form.name.trim() !== "" &&
        form.workflowDefinition !== "" &&
        form.oldProperty.trim() !== "" &&
        form.newProperty.trim() !== "";

    return (
        <Modal isOpen={isOpen} onOpenChange={(open) => !open && close()}>
            <Modal.Header>{t("migrations.create_title")}</Modal.Header>
            <Modal.Body className="flex flex-col gap-4">
                <Input
                    label={t("migrations.fields.name")}
                    value={form.name}
                    onChange={(value) => update("name", value)}
                />
                <div>
                    <InputLabel>{t("migrations.fields.workflow")}</InputLabel>
                    <Select
                        placeholder={t("make_a_choice")}
                        value={form.workflowDefinition}
                        onChange={(value) =>
                            setForm((current) => ({
                                ...current,
                                workflowDefinition: String(value),
                                oldProperty: "",
                            }))
                        }
                    >
                        {workflowDefinitions.map((definition) => (
                            <SelectItem key={definition.name}>{definition.name}</SelectItem>
                        ))}
                    </Select>
                </div>
                <div>
                    <InputLabel>{t("migrations.fields.old_property")}</InputLabel>
                    <Select
                        placeholder={t("make_a_choice")}
                        value={form.oldProperty}
                        onChange={(value) => update("oldProperty", String(value))}
                        isDisabled={!selectedDefinition}
                    >
                        {selectedDefinition?.properties.map((property) => (
                            <SelectItem key={property}>{property}</SelectItem>
                        )) ?? []}
                    </Select>
                </div>
                <Input
                    label={t("migrations.fields.new_property")}
                    value={form.newProperty}
                    onChange={(value) => update("newProperty", value)}
                />
                <TextArea
                    label={t("migrations.fields.description")}
                    value={form.description}
                    onChange={(value) => update("description", value)}
                    rows={3}
                />
                {error && <Callout type="error">{error}</Callout>}
            </Modal.Body>
            <Modal.Footer>
                <Button
                    intent="primary"
                    disabled={!isComplete}
                    isLoading={isLoading}
                    onClick={() => void create()}
                >
                    {t("migrations.create")}
                </Button>
                <Button intent="secondary" onClick={close} disabled={isLoading}>
                    {t("cancel")}
                </Button>
            </Modal.Footer>
        </Modal>
    );
}

function apiErrorMessage(error: unknown, fallback: string) {
    if (!error || typeof error !== "object" || !("data" in error)) return fallback;
    const data = error.data;
    if (typeof data === "string") return data;
    if (data && typeof data === "object" && "message" in data && typeof data.message === "string") {
        return data.message;
    }
    return fallback;
}

export default Migrations;
