import {useState} from "react";

import {FileUpload} from "@datanose/ui";

import {useTranslate} from "~/hooks/useTranslate";
import type {LocalString} from "~/hooks/useTranslate";

interface FileUploadTableProps {
    description?: LocalString;
    onFileSelect?: (file: File | null) => void;
    value?: File | null;
}

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB in bytes

export const FileUploadTable = ({description, onFileSelect, value}: FileUploadTableProps) => {
    const {t, l} = useTranslate("workflow");
    const [selectedFile, setSelectedFile] = useState<File | null>(value || null);
    const handleFileSelect = (file: File | null) => {
        setSelectedFile(file);
        onFileSelect?.(file);
    };

    const hasValidFile = selectedFile !== null;

    return (
        <div className="flex flex-col gap-2">
            <table className="w-full border-collapse">
                <thead>
                    <tr className="border-b">
                        <th className="w-8 p-2"></th>
                        <th className="p-2 text-left">{t("file_upload.description")}</th>
                        <th className="p-2 text-left">{t("file_upload.uploaded")}</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td className="p-2 align-top">
                            <div
                                className={`h-3 w-3 rounded-full ${hasValidFile ? "bg-green-500" : "bg-red-500"}`}
                                aria-label={
                                    hasValidFile
                                        ? t("file_upload.uploaded")
                                        : t("file_upload.no_file_uploaded")
                                }
                            />
                        </td>
                        <td className="p-2 align-top">{l(description)}</td>
                        <td className="p-2 align-top">
                            <FileUpload
                                maxSize={MAX_FILE_SIZE}
                                onFileSelect={handleFileSelect}
                                showFileName={true}
                                buttonText={
                                    selectedFile
                                        ? t("file_upload.change_file")
                                        : t("file_upload.upload_file")
                                }
                                buttonIntent="secondary"
                                errorMessages={{
                                    fileSize: t("file_upload.error_max_file_size", {size: "10MB"}),
                                }}
                            />
                        </td>
                    </tr>
                </tbody>
            </table>
            <div className="text-sm text-gray-600">
                {t("file_upload.max_file_size", {size: "10MB"})}
            </div>
        </div>
    );
};
