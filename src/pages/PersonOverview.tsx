import {type To, useLocation, useParams} from "react-router";

import {skipToken} from "@reduxjs/toolkit/query";
import {Container, Text} from "@uva-fnwi/datanose-ui";

import {PageHeader} from "~/components/PageHeader";
import {useDocumentTitle} from "~/hooks/useDocumentTitle";
import {useTranslate} from "~/hooks/useTranslate";
import {PersonalInstancesContent} from "~/pages/Personal";
import {useGetPersonInstancesQuery} from "~/store/api/personalApi";

export default function PersonOverview() {
    const {personId} = useParams();
    const {state} = useLocation();
    const from = (state as {from?: To} | null)?.from;
    const {t} = useTranslate("screens");
    const {currentData, isFetching, isError} = useGetPersonInstancesQuery(personId ?? skipToken);
    const person = currentData?.person;
    const title = person?.displayName ?? t("person.title");
    const isLoading = isFetching && !currentData;
    useDocumentTitle(title);

    return (
        <Container maxWidth={1280}>
            <PageHeader
                title={title}
                description={
                    person && (
                        <Text>{[person.email, person.userName].filter(Boolean).join(" · ")}</Text>
                    )
                }
                backLabel={from ? t("person.back_to_search") : t("person.back_to_home")}
                backTo={from ?? "/"}
                isLoading={isLoading}
            />
            <PersonalInstancesContent
                data={currentData}
                isLoading={isLoading}
                isError={isError}
                personOverview
            />
        </Container>
    );
}
