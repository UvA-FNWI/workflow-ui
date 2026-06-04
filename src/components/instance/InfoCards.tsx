import {useMemo, useState} from "react";

import {Card, Heading, Icon, Link, Skeleton} from "@uva-fnwi/datanose-ui";

import {usefulLinksData} from "./InfoCardsData.tsx";
import {type LocalString, useTranslate} from "~/hooks/useTranslate";
import type {WorkflowInstanceField} from "~/store/api/types/instances.ts";
import {getStringField} from "~/utils/fieldUtils.ts";

interface InfoCardsProps {
    isLoading: boolean;
    fields: WorkflowInstanceField[] | undefined;
}

export function InfoCards({isLoading, fields}: InfoCardsProps) {
    const {t, l} = useTranslate("workflow");
    const [isOpen, setIsOpen] = useState(false);

    const studyManualUrl = getStringField(fields, "Course.StudyManual");

    const allLinks = useMemo(() => {
        if (studyManualUrl) {
            const studyManualTitle = fields?.find((f) => f.key === "Course.StudyManual")
                ?.title as LocalString;
            return [
                {
                    title: studyManualTitle,
                    url: {en: studyManualUrl, nl: studyManualUrl},
                    type: "link" as const,
                },
                ...usefulLinksData,
            ];
        }
        return usefulLinksData;
    }, [studyManualUrl, fields]);

    const visibleLinks = isOpen ? allLinks : allLinks.slice(0, 3);

    return (
        <>
            <Card>
                {isLoading ? (
                    <Skeleton className="h-5 w-28" />
                ) : (
                    <div className="flex flex-col gap-4">
                        <Heading as="h3" size="sm" className="mb-3">
                            {t("good_to_know.title", {count: allLinks.length})}
                        </Heading>
                        {visibleLinks.map((link, index) => (
                            <div key={index} className="flex items-center gap-1">
                                <Icon
                                    name={link.type === "download" ? "download-line" : "link-line"}
                                    className="min-w-5"
                                />
                                <Link href={l(link.url)} underline target="_blank">
                                    {l(link.title)}
                                </Link>
                            </div>
                        ))}
                        {allLinks.length > 3 && (
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
