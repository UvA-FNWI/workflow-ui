import {useCallback} from "react";

import {FileUpload} from "@uva-fnwi/datanose-ui";
import ExcelJS from "exceljs";

import {useTranslate} from "~/hooks/useTranslate.ts";

type ImportFileUploadProps = {
    onFileSelect: (fileName: string, columns: string[]) => void;
    onFileRemove: () => void;
};

export const ImportFileUpload = ({onFileSelect, onFileRemove}: ImportFileUploadProps) => {
    const {t} = useTranslate("screens", {keyPrefix: "import"});

    const parseColumns = useCallback(async (file: File): Promise<string[]> => {
        const buffer = await file.arrayBuffer();
        const workbook = new ExcelJS.Workbook();
        await workbook.xlsx.load(buffer);

        const sheet = workbook.worksheets[0];
        const firstRow = sheet.getRow(1);
        const values = firstRow.values as unknown[];

        return values.slice(1).filter((cell): cell is string => typeof cell === "string");
    }, []);

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
                    onFileSelect(file.name, columns);
                } else {
                    onFileRemove();
                }
            }}
        />
    );
};
