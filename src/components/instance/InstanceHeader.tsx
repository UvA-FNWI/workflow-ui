import {Link} from "react-router";

import {Heading, Icon, Skeleton} from "@datanose/ui";

import {type LocalString, useTranslate} from "~/hooks/useTranslate";

interface InstanceHeaderProps {
    title?: LocalString | string | null;
    isLoading: boolean;
}

export function InstanceHeader({title, isLoading}: InstanceHeaderProps) {
    const {t, l} = useTranslate("workflow");

    if (isLoading) {
        return <Skeleton className="mb-8 h-8 w-48" />;
    }

    const displayTitle =
        (typeof title === "string" ? title : l(title)) || t("instance.workflowInstance");

    return (
        <div className="mb-8 flex flex-col gap-2">
            <Link to="/" className="text-sm text-red-brand hover:opacity-80">
                <Icon name="arrow-left-line" size={"xs"} className="mr-1" color={"current"} />
                {t("home")}
            </Link>
            <Heading as="h1" size="lg">
                {displayTitle}
            </Heading>
        </div>
    );
}
