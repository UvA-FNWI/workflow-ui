import {Card, Heading, Icon, Link, Skeleton, Text} from "@datanose/ui";

import {type LocalString, useTranslate} from "~/hooks/useTranslate";

interface InfoCardsProps {
    isLoading: boolean;
}

export function InfoCards({isLoading}: InfoCardsProps) {
    const {t, l} = useTranslate("workflow");

    // TODO: replace with real data when available
    const mockHelpfulLinks: {title: LocalString; url: string; type: "link" | "download"}[] = [
        {
            title: {en: "Help with methods and statistics", nl: "Hulp bij methoden en statistiek"},
            url: "https://student.uva.nl/en/information/help-with-methods-and-statistics",
            type: "link",
        },
        {
            title: {
                en: "Key competences of academic writing",
                nl: "Waar een academische tekst aan moet voldoen ",
            },
            url: "https://student.uva.nl/en/information/key-competences-of-academic-writing",
            type: "link",
        },
        {
            title: {en: "Creating a study plan", nl: "Een planning maken"},
            url: "https://student.uva.nl/informatie/een-planning-maken",
            type: "link",
        },
        {
            title: {en: "Plagiarism and fraud", nl: "Plagiaat en fraude"},
            url: "https://student.uva.nl/informatie/plagiaat-en-fraude",
            type: "link",
        },
        {
            title: {en: "Example download file", nl: "Voorbeeld download bestand"},
            url: "#",
            type: "download",
        },
    ];

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
