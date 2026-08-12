import {useMemo} from "react";

import {createColumnHelper} from "@tanstack/react-table";
import {Callout, Text} from "@uva-fnwi/datanose-ui";

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
                    cell: ({row}) => {
                        const value = row.original.values[col.name] ?? "—";
                        const errors = row.original.validationErrors?.filter(
                            (e) => e.column === col.name,
                        );

                        if (errors?.length) {
                            return (
                                <div className="flex flex-col gap-1">
                                    {value}
                                    {errors.map((error, i) => (
                                        <Callout key={i} type="error">
                                            {error.message[
                                                i18n.language as keyof typeof error.message
                                            ] ?? error.code}
                                        </Callout>
                                    ))}
                                </div>
                            );
                        }

                        return value;
                    },
                }),
            ) ?? [],
        [data?.columns, i18n.language],
    );

    if (!data?.rows?.length) {
        return <Text>{t("no_data")}</Text>;
    }

    return <DataTable data={data.rows} columns={columns} />;
};
