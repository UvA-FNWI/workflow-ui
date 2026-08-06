import {Text} from "@uva-fnwi/datanose-ui";

import {useTranslate} from "~/hooks/useTranslate.ts";
import type {ImportPreview} from "~/store/api/types/import.ts";

type ImportOverviewProps = {
    data?: ImportPreview;
};

export const ImportOverview = ({data}: ImportOverviewProps) => {
    const {t} = useTranslate("screens", {keyPrefix: "import"});
    console.log(data, t);
    return (
        <div>
            <Text>Placeholder</Text>
        </div>
    );
};
