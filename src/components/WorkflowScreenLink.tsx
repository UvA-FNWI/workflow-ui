import {Icon} from "@uva-fnwi/datanose-ui";

import {HomeListLink} from "~/components/HomeListLink";
import {useTranslate} from "~/hooks/useTranslate";
import type {WorkflowDefinition} from "~/store/api/types/workflowDefinitions";

export type WorkflowScreen = {
    definition: Pick<WorkflowDefinition, "name" | "title" | "titlePlural" | "screens">;
    name: string;
};

export function WorkflowScreenLink({definition, name}: WorkflowScreen) {
    const {l} = useTranslate("workflow");

    return (
        <HomeListLink
            to={`/screens/${definition.name}/${name}`}
            title={l(definition.title) || definition.name}
            subtitle={
                definition.screens.length > 1 ? name : l(definition.titlePlural) || definition.name
            }
            icon={<Icon name="folder-line" decorative />}
            iconClassName="bg-grey-100 text-grey-700"
        />
    );
}
