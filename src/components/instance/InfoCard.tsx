import {useState} from "react";

import {Card, Heading, Icon, Link, Skeleton} from "@uva-fnwi/datanose-ui";

import {MarkdownRenderer} from "~/components/MarkdownRenderer.tsx";
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

    if (resource.type === "Text") {
        return (
            <Card className="flex flex-col gap-4">
                <Heading as="h3" size="sm">
                    {l(resource.title)}
                </Heading>
                <MarkdownRenderer>{l(resource.content) ?? ""}</MarkdownRenderer>
            </Card>
        );
    }

    if (resource.type !== "Links" || !resource.items) return null;

    const validLinks = resource.items.filter((item) => {
        const text = l(item.url);
        return text != null && text.trim() !== "";
    });

    const displayedLinks = isOpen ? validLinks : validLinks.slice(0, 3);

    const title = `[${validLinks.length}x] ${l(resource.title)}`;

    return (
        <Card className="flex flex-col gap-4">
            <Heading as="h3" size="sm">
                {title}
            </Heading>
            {displayedLinks.map((link, index) => (
                <div key={index} className="flex items-center gap-1">
                    <Icon
                        name={link.type == "Download" ? "download-line" : "link-line"}
                        className="min-w-5"
                    />
                    <Link
                        href={l(link.url)}
                        underline
                        target="_blank"
                        {...(link.type === "Download" && {download: true})}
                    >
                        {l(link.text)}
                    </Link>
                </div>
            ))}
            {validLinks.length > 3 && (
                <Link
                    intent="destructive"
                    onClick={() => setIsOpen((prev) => !prev)}
                    className="underline"
                >
                    {isOpen ? t("show_less") : t("show_all")}
                </Link>
            )}
        </Card>
    );
}
