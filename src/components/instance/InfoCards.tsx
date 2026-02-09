import {Card, Heading, Skeleton, Text} from "@datanose/ui";

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
                    <div className="flex flex-col gap-2">
                        <Heading as="h3" size="sm">
                            {t("how_to_choose_a_subject.title")}
                        </Heading>
                        <span>
                            <Text fontWeight="semibold">
                                1. {t("info.choose_something_interesting.title")}
                            </Text>
                            <Text>{t("info.choose_something_interesting.text")}</Text>
                        </span>
                        <span>
                            <Text fontWeight="semibold">
                                2. {t("info.choose_a_defined_topic.title")}
                            </Text>
                            <Text>{t("info.choose_a_defined_topic.text")}</Text>
                        </span>
                        <span>
                            <Text fontWeight="semibold">
                                3. {t("info.pay_attention_to_feasibility.title")}
                            </Text>
                            <Text>{t("info.pay_attention_to_feasibility.text")}</Text>
                        </span>
                    </div>
                )}
            </Card>
        </>
    );
}
