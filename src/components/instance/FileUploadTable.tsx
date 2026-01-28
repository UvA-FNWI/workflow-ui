import {useState} from "react";

import {FileUpload, Text, useToast} from "@datanose/ui";

import {useTranslate} from "~/hooks/useTranslate";
import type {Answer, Question} from "~/store/api/types/submissions";
import {downloadFile} from "~/utils/fileDownload";

interface FileUploadTableProps {
    instanceId: string;
    submissionId: string;
    questions: Question[];
    values: Record<string, File | null>;
    answers?: Answer[];
    onFileSelect: (
        questionName: string,
        file: File | null,
    ) => Promise<{success: boolean; error: Error | null}>;
    onRemoveStoredFile?: (questionName: string) => Promise<void>;
}

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB in bytes

export const FileUploadTable = ({
    instanceId,
    submissionId,
    questions,
    values,
    answers,
    onFileSelect,
    onRemoveStoredFile,
}: FileUploadTableProps) => {
    const {t, l} = useTranslate("workflow");
    const toast = useToast();
    const [uploadErrors, setUploadErrors] = useState<Record<string, string>>({});
    const [uploadingFiles, setUploadingFiles] = useState<Record<string, boolean>>({});

    // Functions
    const handleFileSelect = async (
        questionName: string,
        file: File | null,
        hasStoredFiles: boolean,
    ) => {
        setUploadingFiles((prev) => ({...prev, [questionName]: true}));
        setUploadErrors((prev) => ({...prev, [questionName]: ""}));

        try {
            // Handle removal of stored files
            if (file === null && hasStoredFiles && onRemoveStoredFile) {
                try {
                    await onRemoveStoredFile(questionName);
                    toast.success(t("file_upload.removed_success"));
                } catch (error) {
                    console.error(error);
                    toast.error(t("file_upload.error_remove_failed"));
                    return;
                }
            }

            // Handle file selection/upload
            const result = await onFileSelect(questionName, file);

            if (!result.success) {
                setUploadErrors((prev) => ({
                    ...prev,
                    [questionName]: result.error?.message || t("file_upload.error_upload_failed"),
                }));
            }
        } finally {
            setUploadingFiles((prev) => ({...prev, [questionName]: false}));
        }
    };

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
                    {questions.map((question) => {
                        const selectedFile = values[question.name];
                        const answer = answers?.find((a) => a.questionName === question.name);
                        const storedFiles = answer?.files || [];
                        const isLoading = !!uploadingFiles[question.name];
                        const hasValidFile =
                            (selectedFile !== null && selectedFile !== undefined) ||
                            (!isLoading && storedFiles.length > 0);

                        return (
                            <tr key={question.name} className="border-b">
                                <td className="align-center p-2">
                                    <div
                                        className={`h-3 w-3 rounded-full ${hasValidFile ? "bg-green-500" : "bg-red-500"}`}
                                        aria-label={
                                            hasValidFile
                                                ? t("file_upload.uploaded")
                                                : t("file_upload.no_file_uploaded")
                                        }
                                    />
                                </td>
                                <td className="align-center p-2">
                                    <div className="font-medium">{l(question.text)}</div>
                                    {question.description && (
                                        <div className="text-sm text-gray-600">
                                            {l(question.description)}
                                        </div>
                                    )}
                                </td>
                                <td className="p-2 align-top">
                                    <div className="flex flex-col gap-2">
                                        <FileUpload
                                            maxSize={MAX_FILE_SIZE}
                                            onFileSelect={(file: File | null) =>
                                                handleFileSelect(
                                                    question.name,
                                                    file,
                                                    storedFiles.length > 0,
                                                )
                                            }
                                            showFileName={true}
                                            fileName={
                                                selectedFile?.name ||
                                                (!isLoading ? storedFiles[0]?.name : undefined)
                                            }
                                            onFileNameClick={() =>
                                                downloadFile(
                                                    storedFiles[0],
                                                    question.name,
                                                    instanceId,
                                                    submissionId,
                                                )
                                            }
                                            buttonText={
                                                selectedFile || storedFiles.length > 0
                                                    ? t("file_upload.change_file")
                                                    : t("file_upload.upload_file")
                                            }
                                            buttonIntent="secondary"
                                            isLoading={uploadingFiles[question.name]}
                                            allowRemove={true}
                                            errorMessages={{
                                                fileSize: t("file_upload.error_max_file_size", {
                                                    size: "10MB",
                                                }),
                                            }}
                                        />
                                        {uploadErrors[question.name] && (
                                            <Text size="sm" className="text-red-600">
                                                {uploadErrors[question.name]}
                                            </Text>
                                        )}
                                    </div>
                                </td>
                            </tr>
                        );
                    })}
                </tbody>
            </table>
            <div className="ui:text-sm ui:text-grey-600 ui:dark:text-grey-400">
                {t("file_upload.max_file_size", {size: "10MB"})}
            </div>
        </div>
    );
};
