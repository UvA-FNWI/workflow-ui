import {useRef, useState} from "react";

import {Button, FileUpload, Icon, Link, Text, useToast} from "@uva-fnwi/datanose-ui";

import {MarkdownRenderer} from "~/components/MarkdownRenderer.tsx";
import {useTranslate} from "~/hooks/useTranslate";
import type {Answer, Question} from "~/store/api/types/submissions";
import {downloadFile} from "~/utils/fileDownload";
import {formatAllowedFileSize, formatAllowedFileTypes, toFileInputAccept} from "~/utils/fileTypes";

interface FileUploadTableProps {
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
    onRemoveStoredFile: (questionName: string, artifactId?: string) => Promise<void>;
}

export const FileUploadTable = ({
    questions,
    values,
    answers,
    onFileSelect,
    onRemoveStoredFile,
}: FileUploadTableProps) => {
    const {t, l, i18n} = useTranslate("workflow");
    const toast = useToast();
    const [uploadErrors, setUploadErrors] = useState<Record<string, string>>({});
    const [uploadingFiles, setUploadingFiles] = useState<Record<string, boolean>>({});
    const fileInputs = useRef<Record<string, HTMLInputElement | null>>({});

    const handleMultipleFiles = async (
        question: Question,
        files: FileList,
        currentSize: number,
    ) => {
        const selected = Array.from(files);
        if (
            currentSize + selected.reduce((sum, file) => sum + file.size, 0) >
            question.allowedFileSize!
        ) {
            setUploadErrors((prev) => ({
                ...prev,
                [question.name]: t("file_upload.error_max_file_size", {
                    size: formatAllowedFileSize(question.allowedFileSize!),
                }),
            }));
            return;
        }
        setUploadingFiles((prev) => ({...prev, [question.name]: true}));
        setUploadErrors((prev) => ({...prev, [question.name]: ""}));
        try {
            for (const file of selected) {
                const result = await onFileSelect(question.name, file);
                if (!result.success) {
                    setUploadErrors((prev) => ({
                        ...prev,
                        [question.name]:
                            result.error?.message || t("file_upload.error_upload_failed"),
                    }));
                    break;
                }
            }
        } finally {
            setUploadingFiles((prev) => ({...prev, [question.name]: false}));
        }
    };

    const removeStoredFile = async (questionName: string, artifactId?: string) => {
        try {
            await onRemoveStoredFile(questionName, artifactId);
            toast.success(t("file_upload.removed_success"));
            return true;
        } catch (error) {
            console.error(error);
            toast.error(t("file_upload.error_remove_failed"));
            return false;
        }
    };

    const handleFileSelect = async (
        questionName: string,
        file: File | null,
        hasStoredFiles: boolean,
    ) => {
        setUploadingFiles((prev) => ({...prev, [questionName]: true}));
        setUploadErrors((prev) => ({...prev, [questionName]: ""}));

        try {
            if (file === null && hasStoredFiles && !(await removeStoredFile(questionName))) return;

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
        <div className="mb-2 max-w-full gap-2 overflow-x-auto">
            <table className="w-full table-fixed border-collapse">
                <thead>
                    <tr className="border-b border-grey-300 dark:border-grey-600">
                        <th className="w-8 px-2"></th>
                        <th className="w-1/2 px-2 text-left font-semibold">
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
                            ((selectedFile != null && !question.isArray) ||
                                (!isLoading && storedFiles.length > 0));
                        const fileName = !hasError
                            ? selectedFile?.name || (!isLoading ? storedFiles[0]?.name : undefined)
                            : undefined;
                        const allowedFileTypesText = formatAllowedFileTypes(
                            question.allowedFileTypes!,
                            i18n.language,
                        );
                        const allowedFileSizeText = formatAllowedFileSize(
                            question.allowedFileSize!,
                        );

                        const statusIndicatorClass = hasValidFile
                            ? "bg-green-600"
                            : question.isRequired
                              ? "bg-red-brand"
                              : "bg-grey-600";

                        return (
                            <tr
                                key={question.name}
                                className="border-b border-grey-300 dark:border-grey-600"
                            >
                                <td className="align-center p-2">
                                    <div
                                        className={`h-3 w-3 rounded-full ${statusIndicatorClass}`}
                                        aria-label={
                                            hasValidFile
                                                ? t("file_upload.uploaded")
                                                : t("file_upload.no_file_uploaded")
                                        }
                                    />
                                </td>
                                <td className="align-center p-2">
                                    <div className="flex justify-between gap-1">
                                        <div className="font-medium">{l(question.text)}</div>
                                        {!question.isRequired && (
                                            <Text className="text-grey-900 italic" size="sm">
                                                {t("optional")}
                                            </Text>
                                        )}
                                    </div>
                                    {question.description && (
                                        <div className="text-sm text-grey-600 dark:text-grey-400">
                                            <MarkdownRenderer>
                                                {l(question.description)}
                                            </MarkdownRenderer>
                                        </div>
                                    )}
                                    <div className="text-sm text-grey-600 dark:text-grey-400">
                                        {t(
                                            question.allowedFileTypes?.includes("*")
                                                ? "file_upload.allowed_any_file_type"
                                                : "file_upload.allowed_file_types",
                                            {
                                                types: allowedFileTypesText,
                                                size: allowedFileSizeText,
                                            },
                                        )}
                                    </div>
                                </td>
                                <td className="min-w-0 p-2 align-top">
                                    <div className="flex min-w-0 flex-col gap-2">
                                        {question.isArray ? (
                                            <div className="flex min-w-0 flex-col gap-2">
                                                {storedFiles.map((file) => (
                                                    <div
                                                        key={file.id}
                                                        className="grid min-w-0 grid-cols-[minmax(0,1fr)_auto] items-center gap-2"
                                                    >
                                                        <Link
                                                            intent="primary"
                                                            underline
                                                            className="block min-w-0 truncate"
                                                            title={file.name}
                                                            onClick={() => downloadFile(file)}
                                                        >
                                                            {file.name}
                                                        </Link>
                                                        <Button
                                                            intent="ghost"
                                                            size="square"
                                                            aria-label={`${t("instance.summary.delete_file")}: ${file.name}`}
                                                            onClick={() =>
                                                                removeStoredFile(
                                                                    question.name,
                                                                    file.id,
                                                                )
                                                            }
                                                            disabled={isLoading}
                                                        >
                                                            <Icon
                                                                name="trash-line"
                                                                size="sm"
                                                                color="current"
                                                            />
                                                        </Button>
                                                    </div>
                                                ))}
                                                <Button
                                                    intent="primary"
                                                    variant="destructive"
                                                    className="w-fit"
                                                    leftIcon={
                                                        <Icon
                                                            name="upload-line"
                                                            size="sm"
                                                            color="current"
                                                        />
                                                    }
                                                    isLoading={isLoading}
                                                    onClick={() =>
                                                        fileInputs.current[question.name]?.click()
                                                    }
                                                >
                                                    {t("file_upload.select_files")}
                                                </Button>
                                                <input
                                                    ref={(input) => {
                                                        fileInputs.current[question.name] = input;
                                                    }}
                                                    type="file"
                                                    multiple
                                                    className="sr-only"
                                                    aria-label={`${l(question.text)}: ${t("file_upload.select_files")}`}
                                                    accept={toFileInputAccept(
                                                        question.allowedFileTypes!,
                                                    ).join(",")}
                                                    disabled={isLoading}
                                                    onChange={(event) => {
                                                        if (event.target.files?.length)
                                                            void handleMultipleFiles(
                                                                question,
                                                                event.target.files,
                                                                storedFiles.reduce(
                                                                    (sum, file) =>
                                                                        sum + (file.length ?? 0),
                                                                    0,
                                                                ),
                                                            );
                                                        event.target.value = "";
                                                    }}
                                                />
                                            </div>
                                        ) : (
                                            <FileUpload
                                                maxSize={question.allowedFileSize}
                                                onFileSelect={(file: File | null) =>
                                                    handleFileSelect(
                                                        question.name,
                                                        file,
                                                        storedFiles.length > 0,
                                                    )
                                                }
                                                showFileName={!hasError && !isLoading}
                                                fileName={fileName}
                                                onFileNameClick={() => downloadFile(storedFiles[0])}
                                                buttonText={t("file_upload.upload_file")}
                                                buttonIntent="primary"
                                                buttonVariant="destructive"
                                                isLoading={isLoading}
                                                errorMessages={{
                                                    fileType: t("file_upload.error_file_type", {
                                                        types: allowedFileTypesText,
                                                    }),
                                                    fileSize: t("file_upload.error_max_file_size", {
                                                        size: allowedFileSizeText,
                                                    }),
                                                }}
                                                hasError={hasError}
                                                accept={toFileInputAccept(
                                                    question.allowedFileTypes!,
                                                )}
                                            />
                                        )}
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
        </div>
    );
};
