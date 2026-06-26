import {useState} from "react";

import {Button, FileUpload, Icon, Text} from "@uva-fnwi/datanose-ui";

import {useTranslate} from "~/hooks/useTranslate.ts";
import {answersApi} from "~/store/api/answersApi.ts";
import type {Answer, Question} from "~/store/api/types/submissions.ts";
import {downloadFile} from "~/utils/fileDownload.ts";

type Props = {
    question: Question;
    answer: Answer | null;
    instanceId: string;
    submissionId: string;
    onClose: () => void;
};

const MAX_FILE_SIZE = 20 * 1024 * 1024; // 20MB

export const InlineFileEdit = ({question, answer, instanceId, submissionId, onClose}: Props) => {
    const {t} = useTranslate("workflow");
    const [saveFile, {isLoading: isUploading}] = answersApi.endpoints.saveFile.useMutation();
    const [saveAnswer, {isLoading: isDeleting}] = answersApi.endpoints.saveAnswer.useMutation();
    const [error, setError] = useState<string | null>(null);

    const hasFile = answer?.value != null && answer.files.length > 0;
    const isLoading = isUploading || isDeleting;

    const handleUpload = async (file: File | null) => {
        if (!file) return;
        setError(null);

        const result = await saveFile({
            instanceId,
            submissionId,
            questionName: question.name,
            file,
        });

        if ("error" in result) {
            setError(t("file_upload.error_upload_failed"));
        } else {
            onClose();
        }
    };

    const handleDelete = async () => {
        setError(null);

        const result = await saveAnswer({
            instanceId,
            submissionId,
            answer: {questionName: question.name, value: null},
        });

        if ("error" in result) {
            setError(t("file_upload.error_remove_failed"));
        } else {
            onClose();
        }
    };

    if (question.isRequired) {
        return (
            <div className="flex flex-col gap-2">
                <FileUpload
                    maxSize={MAX_FILE_SIZE}
                    accept={["application/pdf"]}
                    onFileSelect={handleUpload}
                    buttonText={t("file_upload.upload_file")}
                    buttonIntent="primary"
                    buttonVariant="destructive"
                    isLoading={isUploading}
                    showFileName={hasFile}
                    fileName={answer?.files[0]?.name}
                    onFileNameClick={
                        hasFile
                            ? () =>
                                  downloadFile(
                                      answer.files[0],
                                      question.name,
                                      instanceId,
                                      submissionId,
                                  )
                            : undefined
                    }
                    errorMessages={{
                        fileSize: t("file_upload.error_max_file_size", {size: "20MB"}),
                    }}
                />
                {error && (
                    <Text size="sm" intent="error">
                        {error}
                    </Text>
                )}
                <div>
                    <Button variant="destructive" intent="secondary" onClick={onClose}>
                        {t("cancel")}
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <div className="flex flex-col gap-2">
            {hasFile ? (
                <div className="flex items-center gap-2">
                    <Text as="span" className="truncate">
                        {answer.files[0].name}
                    </Text>
                    <Button
                        intent="ghost"
                        size="small"
                        shape="circular"
                        onClick={handleDelete}
                        isLoading={isDeleting}
                        aria-label={t("delete")}
                    >
                        <Icon name="trash-line" size="xs" color="danger" />
                    </Button>
                </div>
            ) : (
                <FileUpload
                    maxSize={MAX_FILE_SIZE}
                    accept={["application/pdf"]}
                    onFileSelect={handleUpload}
                    buttonText={t("file_upload.upload_file")}
                    buttonIntent="primary"
                    buttonVariant="destructive"
                    isLoading={isUploading}
                    errorMessages={{
                        fileSize: t("file_upload.error_max_file_size", {size: "20MB"}),
                    }}
                />
            )}
            {error && (
                <Text size="sm" intent="error">
                    {error}
                </Text>
            )}
            <div>
                <Button
                    variant="destructive"
                    intent="secondary"
                    onClick={onClose}
                    disabled={isLoading}
                >
                    {t("cancel")}
                </Button>
            </div>
        </div>
    );
};
