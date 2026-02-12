import {Card, Heading, Icon, Link, Skeleton, Text} from "@datanose/ui";

import {mockHelpfulLinks, mockSubjectTips} from "./InfoCardsMockData";
import {useTranslate} from "~/hooks/useTranslate";

interface InfoCardsProps {
    isLoading: boolean;
}

export function InfoCards({isLoading}: InfoCardsProps) {
    const {t, l} = useTranslate("workflow");

    return (
        <>
            <Card>
                {isLoading ? (
                    <Skeleton className="h-5 w-28" />
                ) : (
                    <div className="flex flex-col gap-4">
                        <Heading as="h3" size="sm" className="mb-3">
                            {t("good_to_know.title", {count: mockHelpfulLinks.length})}
                        </Heading>
                        {mockHelpfulLinks.map((link, index) => (
                            <div key={index} className="flex items-center gap-1">
                                <Icon
                                    name={link.type === "download" ? "download-line" : "link-line"}
                                    className="min-w-5"
                                />
                                <Link href={link.url} underline target="_blank">
                                    {l(link.title)}
                                </Link>
                            </div>
                        ))}
                    </div>
                )}
            </Card>
            <Card>
                {isLoading ? (
                    <Skeleton className="h-5 w-24" />
                ) : (
                    <div className="flex flex-col gap-4">
                        <Heading as="h3" size="sm">
                            {t("how_to_choose_a_subject.title")}
                        </Heading>
                        {mockSubjectTips.map((tip, index) => (
                            <span key={index}>
                                <Text fontWeight="semibold">
                                    {index + 1}. {l(tip.title)}
                                </Text>
                                <Text>{l(tip.text)}</Text>
                            </span>
                        ))}
                    </div>
                )}
            </Card>
        </>
    );
}
