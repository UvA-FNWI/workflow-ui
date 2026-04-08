import {useState} from "react";

import {Card, Heading, Icon, Link, Skeleton} from "@datanose/ui";

import {mockHelpfulLinks} from "./InfoCardsMockData";
import {useTranslate} from "~/hooks/useTranslate";

interface InfoCardsProps {
    isLoading: boolean;
}

export function InfoCards({isLoading}: InfoCardsProps) {
    const {t, l} = useTranslate("workflow");
    const [isOpen, setIsOpen] = useState(false);

    const visibleLinks = isOpen ? mockHelpfulLinks : mockHelpfulLinks.slice(0, 3);

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
                        {visibleLinks.map((link, index) => (
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
                        {mockHelpfulLinks.length > 3 && (
                            <Link
                                intent="destructive"
                                onClick={() => setIsOpen((prev) => !prev)}
                                className="underline"
                            >
                                {isOpen ? t("good_to_know.show_less") : t("good_to_know.show_all")}
                            </Link>
                        )}
                    </div>
                )}
            </Card>
        </>
    );
}
