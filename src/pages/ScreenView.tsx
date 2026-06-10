import {useState} from "react";

import {useParams} from "react-router";

import {Card, Container, Heading, SearchInput} from "@uva-fnwi/datanose-ui";

import {ScreenTable} from "~/components/ScreenTable";
import {useTranslate} from "~/hooks/useTranslate";
import {useGetScreenQuery} from "~/store/api/screensApi";

export const ScreenView = () => {
    const {t} = useTranslate("common");
    const {workflowDefinition, screenName} = useParams();
    const {data: screen} = useGetScreenQuery(
        {workflowDefinition: workflowDefinition ?? "", screenName: screenName ?? ""},
        {skip: !workflowDefinition || !screenName},
    );
    const [search, setSearch] = useState("");

    if (!screen) {
        return null;
    }

    return (
        <Container maxWidth={1280}>
            <Card>
                <div className="mb-4">
                    <div className="flex w-full justify-between">
                        <Heading as="h1">{screen.workflowDefinition}</Heading>
                        <SearchInput
                            value={search}
                            onChange={setSearch}
                            placeholder={t("search_placeholder")}
                            className="w-fit max-w-sm"
                        />
                    </div>
                </div>
                <ScreenTable columns={screen.columns} rows={screen.rows} globalFilter={search} />
            </Card>
        </Container>
    );
};
