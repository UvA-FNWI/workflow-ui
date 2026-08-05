import {Callout, Text} from "@uva-fnwi/datanose-ui";

import {useTranslate} from "~/hooks/useTranslate.ts";

type ImportColumnSelectionProps = {
    columns: string[];
};

export const ImportColumnSelection = ({columns}: ImportColumnSelectionProps) => {
    const {t} = useTranslate("screens", {keyPrefix: "import"});

    return (
        <div>
            <Text>file name</Text>
            <Text>{t("select_student_number")}</Text>
            {/*<SelectInput state={} valueProps={} triggerProps={} triggerRef={}/>*/}
            <div>
                <Text>{t("column_selection")}</Text>
                {columns.map((col) => (
                    <Text>{col}</Text>
                ))}
            </div>
            <Callout>{t("staff_info_callout")}</Callout>
        </div>
    );
};
