import {rankItem} from "@tanstack/match-sorter-utils";

import type {ScreenColumn, ScreenRow} from "~/store/api/types/screens";
import {getComparableTableCellValue} from "~/utils/tableCellValues";

export function filterScreenRows(
    columns: ScreenColumn[],
    rows: ScreenRow[],
    search: string,
    language: string,
) {
    if (!search) return rows;
    const searchableColumns = columns.filter((column) => column.displayType !== "ExportOnly");
    return rows.filter((row) =>
        searchableColumns.some(
            (column) =>
                rankItem(
                    getComparableTableCellValue(row.values[column.id], column.dataType, language),
                    search,
                ).passed,
        ),
    );
}
