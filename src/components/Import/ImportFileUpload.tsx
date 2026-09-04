import {FileUpload} from "@uva-fnwi/datanose-ui";

import {useTranslate} from "~/hooks/useTranslate.ts";
import {parseColumnsCsv, parseColumnsExcel} from "~/utils/importUtils.ts";

type ImportFileUploadProps = {
    onFileSelect: (file: File, columns: string[]) => void;
    onFileRemove: () => void;
};

export const ImportFileUpload = ({onFileSelect, onFileRemove}: ImportFileUploadProps) => {
    const {t} = useTranslate("screens", {keyPrefix: "import"});

    const parseColumns = async (file: File): Promise<string[]> => {
        if (file.type === "text/csv") {
            return await parseColumnsCsv(file);
        }
        return await parseColumnsExcel(file);
    };

    return (
        <FileUpload
            accept={[".xlsx", ".csv"]}
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
