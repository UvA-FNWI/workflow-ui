import {useMemo} from "react";

import {createColumnHelper} from "@tanstack/react-table";
import {Text} from "@uva-fnwi/datanose-ui";

import {DataTable} from "~/components/Table";
import {useTranslate} from "~/hooks/useTranslate.ts";
import type {ImportPreview, ImportPreviewRow} from "~/store/api/types/import.ts";

const columnHelper = createColumnHelper<ImportPreviewRow>();

type ImportOverviewProps = {
    data?: ImportPreview;
};

export const ImportOverview = ({data}: ImportOverviewProps) => {
    const {t, i18n} = useTranslate("screens", {keyPrefix: "import"});

    const columns = useMemo(
        () =>
            data?.columns.map((col) =>
                columnHelper.display({
                    id: col.name,
                    header: col.title[i18n.language as keyof typeof col.title] ?? col.name,
                    cell: ({row}) => row.original.values[col.name] ?? "—",
                }),
            ) ?? [],
        [data?.columns, i18n.language],
    );

    if (!data?.rows?.length) {
        return <Text>{t("noData")}</Text>;
    }

    return <DataTable data={data.rows} columns={columns} />;
};
