import {useState} from "react";

import {Navigate} from "react-router";

import {Card, Container, SearchInput, Skeleton, Text} from "@uva-fnwi/datanose-ui";

import {MigrationsTable} from "~/components/Migrations";
import {PageHeader} from "~/components/PageHeader";
import {useDocumentTitle} from "~/hooks/useDocumentTitle";
import {useTranslate} from "~/hooks/useTranslate";
import {useGetMigrationsQuery} from "~/store/api/migrationsApi";
import {useGetCurrentUserQuery} from "~/store/api/usersApi";

function Migrations() {
    const {t} = useTranslate(["workflow", "common"]);
    const {data: currentUser, isLoading: isUserLoading} = useGetCurrentUserQuery();
    const {data: migrations = [], isLoading, isError} = useGetMigrationsQuery();
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
        </Container>
    );
}

export default Migrations;
