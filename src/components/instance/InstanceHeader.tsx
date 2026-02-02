import {Link} from "react-router";

import {Heading, Icon, Skeleton} from "@datanose/ui";

import {type LocalString, useTranslate} from "~/hooks/useTranslate";

interface InstanceHeaderProps {
    title?: LocalString | null;
    isLoading: boolean;
}

export function InstanceHeader({title, isLoading}: InstanceHeaderProps) {
    const {t, l} = useTranslate("workflow");

    if (isLoading) {
        return <Skeleton className="mb-8 h-8 w-48" />;
    }

    return (
        <div className="flex flex-col gap-2">
            <Link to="/" className="text-sm text-red-brand hover:opacity-80">
                <Icon name="arrow-left-line" size={"xs"} className="mr-1" color={"current"} />
                {t("home")}
            </Link>
            <Heading as="h1" size="lg" className="mb-8">
                {l(title) || t("instance.workflowInstance")}
            </Heading>
        </div>
    );
}
