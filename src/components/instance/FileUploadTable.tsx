import {useState} from "react";

import {FileUpload, Text, useToast} from "@uva-fnwi/datanose-ui";

import {MarkdownRenderer} from "~/components/MarkdownRenderer.tsx";
import {useTranslate} from "~/hooks/useTranslate";
import type {Answer, Question} from "~/store/api/types/submissions";
import {downloadFile} from "~/utils/fileDownload";

interface FileUploadTableProps {
    instanceId: string;
    submissionId: string;
    questions: Question[];
    values: Record<string, File | null>;
    answers?: Answer[];
    /**
     * Callback when file is selected or removed.
     * Pass null to clear local file selection.
     * Return success: false to show error and clear file.
     */
    onFileSelect: (
        questionName: string,
        file: File | null,
    ) => Promise<{success: boolean; error: Error | null}>;
    /** Callback to remove file from server */
    onRemoveStoredFile: (questionName: string) => Promise<void>;
}

const MAX_FILE_SIZE = 20 * 1024 * 1024; // 10MB in bytes

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

    const handleFileSelect = async (
        questionName: string,
        file: File | null,
        hasStoredFiles: boolean,
    ) => {
        setUploadingFiles((prev) => ({...prev, [questionName]: true}));
        setUploadErrors((prev) => ({...prev, [questionName]: ""}));

        try {
            // Handle removal of stored files from server
            if (file === null && hasStoredFiles) {
                try {
                    await onRemoveStoredFile(questionName);
                    toast.success(t("file_upload.removed_success"));
                } catch (error) {
                    console.error(error);
                    toast.error(t("file_upload.error_remove_failed"));
                    return;
                }
            }

            // Handle file selection/upload or local file clear
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
        <div className="max-w-full gap-2 overflow-x-auto">
            <table className="border-collapse">
                <thead>
                    <tr className="border-b border-grey-300 dark:border-grey-600">
                        <th className="w-8 px-2"></th>
                        <th className="px-2 text-left font-semibold">
                            {t("file_upload.description")}
                        </th>
                        <th className="px-2 text-left font-semibold">
                            {t("file_upload.uploaded")}
                        </th>
                    </tr>
                </thead>
                <tbody>
                    {questions.map((question) => {
                        const selectedFile = values[question.name];
                        const answer = answers?.find((a) => a.questionName === question.name);
                        const storedFiles = answer?.files || [];
                        const isLoading = !!uploadingFiles[question.name];
                        const hasError = !!uploadErrors[question.name];
                        const hasValidFile =
                            !hasError &&
                            ((selectedFile !== null && selectedFile !== undefined) ||
                                (!isLoading && storedFiles.length > 0));
                        const fileName = !hasError
                            ? selectedFile?.name || (!isLoading ? storedFiles[0]?.name : undefined)
                            : undefined;

                        return (
                            <tr
                                key={question.name}
                                className="border-b border-grey-300 dark:border-grey-600"
                            >
                                <td className="align-center p-2">
                                    <div
                                        className={`h-3 w-3 rounded-full ${hasValidFile ? "bg-green-600" : "bg-red-brand"}`}
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
                                        <div className="text-sm text-grey-600 dark:text-grey-400">
                                            <MarkdownRenderer>
                                                {l(question.description) ?? ""}
                                            </MarkdownRenderer>
                                        </div>
                                    )}
                                    <div className="text-sm text-grey-600 dark:text-grey-400">
                                        {t("file_upload.pdf_only")}
                                    </div>
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
                                            showFileName={!hasError}
                                            fileName={fileName}
                                            onFileNameClick={() =>
                                                downloadFile(
                                                    storedFiles[0],
                                                    question.name,
                                                    instanceId,
                                                    submissionId,
                                                )
                                            }
                                            buttonText={t("file_upload.upload_file")}
                                            buttonIntent="primary"
                                            buttonVariant="destructive"
                                            isLoading={uploadingFiles[question.name]}
                                            errorMessages={{
                                                fileSize: t("file_upload.error_max_file_size", {
                                                    size: "20MB",
                                                }),
                                            }}
                                            accept={["application/pdf"]}
                                        />
                                        {uploadErrors[question.name] && (
                                            <Text size="sm" intent="error">
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
            <div className="mt-2 text-sm text-black dark:text-white">
                {t("file_upload.max_file_size", {size: "20MB"})}
            </div>
        </div>
    );
};
