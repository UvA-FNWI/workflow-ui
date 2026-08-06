import {FileUpload} from "@uva-fnwi/datanose-ui";
import ExcelJS from "exceljs";

import {useTranslate} from "~/hooks/useTranslate.ts";
import {extractCellText} from "~/utils/importUtils.ts";

type ImportFileUploadProps = {
    onFileSelect: (file: File, columns: string[]) => void;
    onFileRemove: () => void;
};

export const ImportFileUpload = ({onFileSelect, onFileRemove}: ImportFileUploadProps) => {
    const {t} = useTranslate("screens", {keyPrefix: "import"});

    const parseColumns = async (file: File): Promise<string[]> => {
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

    return (
        <FileUpload
            accept={[".xlsx", ".xls", ".csv"]}
            buttonText={t("upload_file")}
            buttonIntent="secondary"
            buttonSize="large"
            showFileName={true}
            onFileSelect={async (file) => {
                if (file) {
                    const columns = await parseColumns(file);
                    onFileSelect(file, columns);
                } else {
                    onFileRemove();
                }
            }}
        />
    );
};
