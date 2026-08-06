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
