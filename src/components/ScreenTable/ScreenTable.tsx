import {useMemo} from "react";

import {type ColumnDef} from "@tanstack/react-table";
import {Button, Icon, linkClassGenerator, Text} from "@uva-fnwi/datanose-ui";

import {DataTable, ProgressCell} from "~/components/Table";
import {VersionedLink} from "~/components/VersionedLink";
import {useTranslate} from "~/hooks/useTranslate";
import {useVersionedNavigate} from "~/hooks/useVersionedNavigate";
import type {ScreenColumn, ScreenRow} from "~/store/api/types/screens";
import {isProgressInformation} from "~/utils/progress";
import {formatTableCellValue, getComparableTableCellValue} from "~/utils/tableCellValues";

type ScreenTableProps = {
    columns: ScreenColumn[];
    rows: ScreenRow[];
    globalFilter?: string;
};

export const ScreenTable = ({columns, rows, globalFilter = ""}: ScreenTableProps) => {
    const {i18n, l, t} = useTranslate("workflow");
    const navigate = useVersionedNavigate();

    const tableColumns = useMemo<ColumnDef<ScreenRow>[]>(
        () => [
            ...columns
                .filter((col) => col.displayType !== "ExportOnly")
                .map(
                    (col): ColumnDef<ScreenRow> => ({
                        id: String(col.id),
                        accessorFn: (row) =>
                            getComparableTableCellValue(
                                row.values[col.id],
                                col.dataType,
                                i18n.language,
                            ),
                        header: () => l(col.title),
                        cell: (info) => {
                            const value = info.row.original.values[col.id];
                            const formattedValue = formatTableCellValue(
                                value,
                                col.dataType,
                                i18n.language,
                            );

                            // Custom formatting for the progress column
                            if (col.isCurrentStep && col.dataType === "Object") {
                                if (isProgressInformation(value)) {
                                    return <ProgressCell progress={value} />;
                                }
                            }

                            if (col.link) {
                                const rowId = info.row.original.id;
                                return (
                                    <VersionedLink
                                        to={`/instance/${rowId}`}
                                        className={linkClassGenerator({
                                            intent: "primary",
                                            underline: true,
                                            size: "sm",
                                        })}
                                    >
                                        {formattedValue}
                                    </VersionedLink>
                                );
                            }

                            return (
                                <Text size={"sm"} truncate={true} className="max-w-80">
                                    {formattedValue}
                                </Text>
                            );
                        },
                        enableSorting: true,
                    }),
                ),
            {
                id: "actions",
                header: () => <span className="sr-only">{t("screens.actions")}</span>,
                enableSorting: false,
                cell: ({row}) => {
                    const rowId = row.original.id;

                    return (
                        <div className="flex w-auto justify-end p-0">
                            <Button
                                intent="primary"
                                variant="destructive"
                                size="square"
                                width="none"
                                className="flex items-center justify-center rounded-sm text-white"
                                onClick={() => navigate(`/instance/${rowId}`)}
                            >
                                <Icon name="visible-line" color="current" />
                            </Button>
                        </div>
                    );
                },
            },
        ],
        [columns, i18n.language, l, t, navigate],
    );

    return <DataTable data={rows} columns={tableColumns} globalFilter={globalFilter} />;
};
