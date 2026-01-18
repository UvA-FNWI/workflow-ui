import {Card, Heading, Skeleton} from "@datanose/ui";

import {useTranslate} from "~/hooks/useTranslate";

interface InfoCardsProps {
    isLoading: boolean;
}

export function InfoCards({isLoading}: InfoCardsProps) {
    const {t} = useTranslate("workflow");

    return (
        <>
            <Card>
                {isLoading ? (
                    <Skeleton className="h-5 w-28" />
                ) : (
                    <Heading as="h3" size="sm">
                        {t("good_to_know.title")}
                    </Heading>
                )}
            </Card>
            <Card>
                {isLoading ? (
                    <Skeleton className="h-5 w-24" />
                ) : (
                    <Heading as="h3" size="sm">
                        {t("first_help.title")}
                    </Heading>
                )}
            </Card>
        </>
    );
}
