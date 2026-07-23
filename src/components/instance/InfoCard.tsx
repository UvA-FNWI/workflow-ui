import {useState} from "react";

import {Card, Heading, Icon, Link, Skeleton} from "@uva-fnwi/datanose-ui";

import {useTranslate} from "~/hooks/useTranslate";
import type {Resource} from "~/store/api/types/instances.ts";

interface InfoCardProps {
    isLoading: boolean;
    resource: Resource;
}

export function InfoCard({isLoading, resource}: InfoCardProps) {
    const {t, l} = useTranslate("workflow");
    const [isOpen, setIsOpen] = useState(false);

    if (isLoading)
        return (
            <Card>
                <Skeleton className="h-5 w-28" />
            </Card>
        );

    const allLinks =
        resource.type === "Links"
            ? resource.items.filter((item) => item.type === "Link" || item.type === "Download")
            : [];
    const visibleLinks = isOpen ? allLinks : allLinks.slice(0, 3);
    const textContent =
        resource.type === "Text" ? resource.items.filter((item) => item.type === "Text") : [];

    return (
        <>
            <Card className="flex flex-col gap-4">
                <Heading as="h3" size="sm">
                    {l(resource.title)}
                </Heading>
                {resource.type === "Text" && (
                    <div>
                        {textContent.map((item) => (
                            <p key={item.name}>{l(item.text)}</p>
                        ))}
                    </div>
                )}
                {resource.type === "Links" && (
                    <div className="flex flex-col gap-4">
                        {visibleLinks.map((link, index) => (
                            <div key={index} className="flex items-center gap-1">
                                <Icon
                                    name={link.type == "Download" ? "download-line" : "link-line"}
                                    className="min-w-5"
                                />
                                <Link href={l(link.url)} underline target="_blank">
                                    {l(link.text)}
                                </Link>
                            </div>
                        ))}
                        {allLinks.length > 3 && (
                            <Link
                                intent="destructive"
                                onClick={() => setIsOpen((prev) => !prev)}
                                className="underline"
                            >
                                {isOpen ? t("show_less") : t("show_all")}
                            </Link>
                        )}
                    </div>
                )}
            </Card>
        </>
    );
}
