import {useState} from "react";

import {Navigate} from "react-router";

import {
    Button,
    Card,
    Container,
    SearchInput,
    Skeleton,
    Text,
    useToast,
} from "@uva-fnwi/datanose-ui";

import {CreateMigrationModal, MigrationsTable} from "~/components/Migrations";
import {PageHeader} from "~/components/PageHeader";
import {useDocumentTitle} from "~/hooks/useDocumentTitle";
import {useTranslate} from "~/hooks/useTranslate";
import {useGetMigrationsQuery} from "~/store/api/migrationsApi";
import {useGetCurrentUserQuery} from "~/store/api/usersApi";
import {useGetWorkflowDefinitionsQuery} from "~/store/api/workflowDefinitionsApi";

function Migrations() {
    const {t} = useTranslate(["workflow", "common"]);
    const toast = useToast();
    const {data: currentUser, isLoading: isUserLoading} = useGetCurrentUserQuery();
    const {data: definitions = []} = useGetWorkflowDefinitionsQuery({includeAll: true});
    const {data: migrations = [], isLoading, isError, refetch} = useGetMigrationsQuery();
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [search, setSearch] = useState("");

    useDocumentTitle(t("migrations.title"));

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
                    <MigrationsTable migrations={migrations} globalFilter={search} />
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
        </Container>
    );
}

export default Migrations;
