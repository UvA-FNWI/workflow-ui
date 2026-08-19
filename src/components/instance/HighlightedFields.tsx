import {LoadingSpinner, Text} from "@uva-fnwi/datanose-ui";

import {useTranslate} from "~/hooks/useTranslate.ts";
import {instancesEndpoints} from "~/store/api/instancesApi.ts";

interface HighlightedFieldsProps {
    instanceId?: string;
}
export function HighlightedFields({instanceId}: HighlightedFieldsProps) {
    const {l} = useTranslate("workflow");
    const {data: instance, isLoading} = instancesEndpoints.getInstance.useQuery(instanceId ?? "", {
        skip: !instanceId,
    });

    if (!instance) return;

    if (isLoading) {
        return <LoadingSpinner size="xs" />;
    }

    const highlightedFields = instance.fields.filter((f) => f.isHighlighted);

    if (highlightedFields.length == 0) return;

    highlightedFields.sort((a, b) => {
        return (a.order ?? Number.MAX_SAFE_INTEGER) - (b.order ?? Number.MAX_SAFE_INTEGER);
    });

    const description = highlightedFields
        .map((f) => {
            const title = l(f.title);
            const value = String(f.value ?? "");
            return `${title}: ${value}`;
        })
        .join(" | ");

    return <Text>{description}</Text>;
}
