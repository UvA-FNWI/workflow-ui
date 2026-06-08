import {Heading, Skeleton} from "@uva-fnwi/datanose-ui";

import {BackLink} from "~/components/BackLink";
import {type LocalString, useTranslate} from "~/hooks/useTranslate";

interface InstanceHeaderProps {
    courseName?: LocalString | string | null;
    isLoading: boolean;
}

export function InstanceHeader({courseName, isLoading}: InstanceHeaderProps) {
    const {t, l} = useTranslate("workflow");

    if (isLoading) {
        return <Skeleton className="mb-8 h-8 w-48" />;
    }

    const displayTitle =
        (typeof courseName === "string" ? courseName : l(courseName)) ||
        t("instance.workflowInstance");

    return (
        <div className="mb-8 flex flex-col gap-2">
            <BackLink>{t("home")}</BackLink>
            <Heading as="h1" size="lg">
                {displayTitle}
            </Heading>
        </div>
    );
}
