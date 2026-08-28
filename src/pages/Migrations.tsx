import {useCallback, useState} from "react";

import {Navigate} from "react-router";

import {
    Button,
    Callout,
    Card,
    Container,
    Modal,
    SearchInput,
    Skeleton,
    Text,
    useToast,
} from "@uva-fnwi/datanose-ui";

import {CreateMigrationModal, type MigrationAction, MigrationsTable} from "~/components/Migrations";
import {PageHeader} from "~/components/PageHeader";
import {useDocumentTitle} from "~/hooks/useDocumentTitle";
import {useTranslate} from "~/hooks/useTranslate";
import {
    useFinishMigrationMutation,
    useGetMigrationsQuery,
    useRevertMigrationMutation,
} from "~/store/api/migrationsApi";
import type {Migration} from "~/store/api/types/migrations";
import {useGetCurrentUserQuery} from "~/store/api/usersApi";
import {useGetWorkflowDefinitionsQuery} from "~/store/api/workflowDefinitionsApi";

function Migrations() {
    const {t} = useTranslate(["workflow", "common"]);
    const toast = useToast();
    const {data: currentUser, isLoading: isUserLoading} = useGetCurrentUserQuery();
    const {data: definitions = []} = useGetWorkflowDefinitionsQuery({includeAll: true});
    const {data: migrations = [], isLoading, isError, refetch} = useGetMigrationsQuery();
    const [finishMigration, {isLoading: isFinishing}] = useFinishMigrationMutation();
    const [revertMigration, {isLoading: isReverting}] = useRevertMigrationMutation();
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [confirmation, setConfirmation] = useState<{
        migration: Migration;
        action: MigrationAction;
    } | null>(null);
    const [actionError, setActionError] = useState<string | null>(null);
    const [search, setSearch] = useState("");

    useDocumentTitle(t("migrations.title"));

    const selectAction = useCallback((migration: Migration, action: MigrationAction) => {
        setConfirmation({migration, action});
    }, []);

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
                    <MigrationsTable
                        migrations={migrations}
                        globalFilter={search}
                        onAction={selectAction}
                    />
                )}
            </Card>

            {isCreateOpen && (
                <CreateMigrationModal
                    isOpen
                    workflowDefinitions={definitions}
                    onClose={() => setIsCreateOpen(false)}
                    onCreated={async () => {
                        setIsCreateOpen(false);
                        toast.success(t("migrations.create_success"));
                        await refetch();
                    }}
                />
            )}

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
                <Modal.Header>
                    {confirmation?.action === "finish"
                        ? t("migrations.confirm_finish_title")
                        : t("migrations.confirm_revert_title")}
                </Modal.Header>
                <Modal.Body className="flex flex-col gap-4">
                    <Text>
                        {confirmation?.action === "finish"
                            ? t("migrations.confirm_finish", {
                                  oldProperty: confirmation.migration.definition.oldProperty,
                                  newProperty: confirmation.migration.definition.newProperty,
                              })
                            : t("migrations.confirm_revert", {
                                  oldProperty: confirmation?.migration.definition.oldProperty,
                                  newProperty: confirmation?.migration.definition.newProperty,
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
