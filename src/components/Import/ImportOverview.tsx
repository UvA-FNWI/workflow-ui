import {Text} from "@uva-fnwi/datanose-ui";

import {useTranslate} from "~/hooks/useTranslate.ts";

type ImportOverviewProps = {
    data: string[];
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
