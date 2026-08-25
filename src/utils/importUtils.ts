import ExcelJS from "exceljs";
import Papa from "papaparse";

/**
 * Parses the first column of an Excel file, and returns the column names.
 * @param file
 */
export const parseColumnsExcel = async (file: File): Promise<string[]> => {
    const buffer = await file.arrayBuffer();
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.load(buffer);

    const sheet = workbook.worksheets[0];
    const firstRow = sheet.getRow(1);
    const values = firstRow.values as unknown[];

    return values
        .slice(1)
        .map(extractCellText)
        .filter((cell): cell is string => cell !== null);
};

/**
 * Parses the first column of a CSV file, and returns the column names.
 * @param file
 */
export const parseColumnsCsv = async (file: File): Promise<string[]> => {
    const text = await file.text();
    const result = Papa.parse<string[]>(text.trim(), {preview: 1, skipEmptyLines: true});
    return result.data[0]?.map((col) => col.trim()).filter((col) => col.length > 0) ?? [];
};

/**
 * Extracts the text from a cell.
 * @param cell
 */
export const extractCellText = (cell: unknown): string | null => {
    if (typeof cell === "string") return cell;
    if (typeof cell === "number") return String(cell);
    if (
        typeof cell === "object" &&
        cell !== null &&
        "text" in cell &&
        typeof (cell as {text: unknown}).text === "string"
    ) {
        return (cell as {text: string}).text;
    }
    return null;
};
