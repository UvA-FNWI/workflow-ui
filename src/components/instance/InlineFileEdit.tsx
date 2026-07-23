import {useRef, useState} from "react";

import {Button, FileUpload, Icon, Link, Modal, Text} from "@uva-fnwi/datanose-ui";

import {MAX_FILE_SIZE} from "./constants";
import {useTranslate} from "~/hooks/useTranslate.ts";
import {answersApi} from "~/store/api/answersApi.ts";
import type {Answer, Question} from "~/store/api/types/submissions.ts";
import {downloadFile} from "~/utils/fileDownload.ts";

type Props = {
    question: Question;
    answer: Answer | null;
    instanceId: string;
    submissionId: string;
};

export const InlineFileEdit = ({question, answer, instanceId, submissionId}: Props) => {
    const {t} = useTranslate("workflow");
    const [saveFile, {isLoading: isUploading, isError: isUploadError}] =
        answersApi.endpoints.saveFile.useMutation();
    const [saveAnswer, {isLoading: isDeleting, isError: isDeleteError}] =
        answersApi.endpoints.saveAnswer.useMutation();
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [isConfirmDeleteOpen, setIsConfirmDeleteOpen] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [isWaitingForRefetch, setIsWaitingForRefetch] = useState(false);

    const hasFile = answer?.value != null && (answer.files?.length ?? 0) > 0;

    // Keep loading state active until refetched data confirms the file exists
    if (hasFile && isWaitingForRefetch) setIsWaitingForRefetch(false);

    const handleUpload = async (file: File | null) => {
        if (!file) return;
        setIsWaitingForRefetch(true);
        await saveFile({instanceId, submissionId, questionName: question.name, file});
    };

    const handleDelete = async () => {
        await saveAnswer({
            instanceId,
            submissionId,
            answer: {questionName: question.name, value: null},
        });
        setIsConfirmDeleteOpen(false);
    };

    const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0] ?? null;
        if (file) void handleUpload(file);
        e.target.value = "";
    };

    if (!hasFile) {
        if (!isEditing) {
            return (
                <div className="flex min-w-0 items-center">
                    <Text as="span" display="inline">
                        -
                    </Text>
                    <Button
                        intent="ghost"
                        size="small"
                        shape="circular"
                        className="ui:ml-1 ui:border-0 ui:px-1 ui:align-middle ui:hover:enabled:bg-grey-100 ui:dark:hover:enabled:bg-grey-800"
                        onClick={() => setIsEditing(true)}
                        aria-label={t("instance.summary.edit_answer")}
                    >
                        <Icon name="edit-line" size="xs" color="danger" />
                    </Button>
                </div>
            );
        }

        return (
            <div className="flex flex-col gap-1">
                <FileUpload
                    maxSize={MAX_FILE_SIZE}
                    accept={["application/pdf"]}
                    onFileSelect={handleUpload}
                    buttonText={t("file_upload.upload_file")}
                    buttonIntent="primary"
                    buttonVariant="destructive"
                    isLoading={isUploading || isWaitingForRefetch}
                    errorMessages={{
                        fileSize: t("file_upload.error_max_file_size", {size: "10MB"}),
                    }}
                />
                {isUploadError && (
                    <Text size="sm" intent="error">
                        {t("file_upload.error_upload_failed")}
                    </Text>
                )}
            </div>
        );
    }

    return (
        <>
            <div className="flex flex-col gap-1">
                <div className="flex min-w-0 items-center gap-1">
                    <Link
                        intent="primary"
                        underline
                        className="truncate"
                        onClick={() =>
                            downloadFile(answer.files[0], question.name, instanceId, submissionId)
                        }
                    >
                        {answer.files[0].name}
                    </Link>
                    <Button
                        intent="ghost"
                        size="small"
                        shape="circular"
                        className="ui:border-0 ui:px-1 ui:hover:enabled:bg-grey-100 ui:dark:hover:enabled:bg-grey-800"
                        onClick={() => fileInputRef.current?.click()}
                        isLoading={isUploading}
                        aria-label={t("instance.summary.replace_file")}
                    >
                        <Icon name="rotate-right-left-solid" size="xs" color="danger" />
                    </Button>
                    <input
                        ref={fileInputRef}
                        type="file"
                        accept="application/pdf"
                        className="hidden"
                        onChange={handleFileInputChange}
                    />
                    {!question.isRequired && (
                        <Button
                            intent="ghost"
                            size="small"
                            shape="circular"
                            className="ui:border-0 ui:px-1 ui:hover:enabled:bg-grey-100 ui:dark:hover:enabled:bg-grey-800"
                            onClick={() => setIsConfirmDeleteOpen(true)}
                            isLoading={isDeleting}
                            aria-label={t("instance.summary.delete_file")}
                        >
                            <Icon name="trash-line" size="xs" color="danger" />
                        </Button>
                    )}
                </div>
                {(isUploadError || isDeleteError) && (
                    <Text size="sm" intent="error">
                        {isUploadError
                            ? t("file_upload.error_upload_failed")
                            : t("file_upload.error_remove_failed")}
                    </Text>
                )}
            </div>

            <Modal isOpen={isConfirmDeleteOpen} onOpenChange={setIsConfirmDeleteOpen} size="sm">
                <Modal.Header>{t("are_you_sure")}</Modal.Header>
                <Modal.Body>
                    <Text>{t("file_upload.confirm_delete_message")}</Text>
                </Modal.Body>
                <Modal.Footer>
                    <Button
                        intent="primary"
                        variant="destructive"
                        onClick={handleDelete}
                        isLoading={isDeleting}
                    >
                        {t("confirm")}
                    </Button>
                    <Button intent="secondary" onClick={() => setIsConfirmDeleteOpen(false)}>
                        {t("cancel")}
                    </Button>
                </Modal.Footer>
            </Modal>
        </>
    );
};
