import {useRef, useState} from "react";

import {Button, FileUpload, Icon, Link, Modal, Text} from "@uva-fnwi/datanose-ui";

import {useTranslate} from "~/hooks/useTranslate.ts";
import {answersApi} from "~/store/api/answersApi.ts";
import {instancesApi} from "~/store/api/instancesApi.ts";
import {submissionsApi} from "~/store/api/submissionsApi.ts";
import type {Answer, FileQuestion} from "~/store/api/types/submissions.ts";
import {downloadFile} from "~/utils/fileDownload.ts";
import {
    formatAllowedFileSize,
    formatAllowedFileTypes,
    toFileInputAccept,
} from "~/utils/fileTypes.ts";

type Props = {
    question: FileQuestion;
    answer: Answer | null;
    instanceId: string;
    submissionId: string;
};

export const InlineFileEdit = ({question, answer, instanceId, submissionId}: Props) => {
    const {t, i18n} = useTranslate("workflow");
    const [saveFile, {isLoading: isUploading, isError: isUploadError}] =
        answersApi.endpoints.saveFile.useMutation();
    const [saveAnswer, {isLoading: isDeleting, isError: isDeleteError}] =
        answersApi.endpoints.saveAnswer.useMutation();
    const [deleteFile, {isLoading: isDeletingOne}] = answersApi.endpoints.deleteFile.useMutation();
    const {isFetching: isRefreshingInstance} = instancesApi.endpoints.getInstance.useQuery(
        instanceId,
        {
            skip: !question.isArray,
        },
    );
    const {isFetching: isRefreshingSubmission} = submissionsApi.endpoints.getSubmission.useQuery(
        {instanceId, submissionId},
        {skip: !question.isArray},
    );
    const mutationLock = useRef(false);
    const [isMutatingFiles, setIsMutatingFiles] = useState(false);
    const [fileMutationError, setFileMutationError] = useState<string | null>(null);
    const areFilesBusy = isMutatingFiles || isRefreshingInstance || isRefreshingSubmission;
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [isConfirmDeleteOpen, setIsConfirmDeleteOpen] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [isWaitingForRefetch, setIsWaitingForRefetch] = useState(false);
    const [isSizeError, setIsSizeError] = useState(false);
    const allowedFileTypesText = formatAllowedFileTypes(question.allowedFileTypes, i18n.language);
    const fileInputAccept = toFileInputAccept(question.allowedFileTypes);
    const allowedFileSizeText = formatAllowedFileSize(question.allowedFileSize);

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

    const mutateFiles = async (action: () => Promise<void>, errorMessage: string) => {
        if (mutationLock.current || areFilesBusy) return;
        mutationLock.current = true;
        setIsMutatingFiles(true);
        setFileMutationError(null);
        try {
            await action();
        } catch {
            setFileMutationError(errorMessage);
        } finally {
            mutationLock.current = false;
            setIsMutatingFiles(false);
        }
    };

    if (question.isArray) {
        const files = answer?.files ?? [];
        return (
            <div className="flex flex-col gap-2">
                {files.map((file) => (
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
                            isLoading={isDeletingOne}
                            disabled={areFilesBusy}
                            onClick={() =>
                                mutateFiles(async () => {
                                    await deleteFile({
                                        instanceId,
                                        submissionId,
                                        questionName: question.name,
                                        artifactId: file.id,
                                    }).unwrap();
                                }, t("file_upload.error_remove_failed"))
                            }
                        >
                            <Icon name="trash-line" size="sm" color="current" />
                        </Button>
                    </div>
                ))}
                <Button
                    intent="primary"
                    variant="destructive"
                    className="w-fit"
                    leftIcon={<Icon name="upload-line" size="sm" color="current" />}
                    isLoading={areFilesBusy}
                    disabled={areFilesBusy}
                    onClick={() => fileInputRef.current?.click()}
                >
                    {t("file_upload.select_files")}
                </Button>
                <input
                    ref={fileInputRef}
                    type="file"
                    disabled={areFilesBusy}
                    multiple
                    className="sr-only"
                    aria-label={t("file_upload.select_files")}
                    accept={fileInputAccept.join(",")}
                    onChange={async (event) => {
                        if (mutationLock.current || areFilesBusy) return;
                        const selected = Array.from(event.target.files ?? []);
                        event.target.value = "";
                        setIsSizeError(false);
                        if (
                            selected.reduce(
                                (sum, file) => sum + file.size,
                                files.reduce((sum, file) => sum + file.length, 0),
                            ) > question.allowedFileSize
                        ) {
                            setIsSizeError(true);
                            return;
                        }
                        if (!selected.length) return;
                        await mutateFiles(async () => {
                            for (const file of selected) {
                                await saveFile({
                                    instanceId,
                                    submissionId,
                                    questionName: question.name,
                                    file,
                                }).unwrap();
                            }
                        }, t("file_upload.error_upload_failed"));
                    }}
                />
                {isSizeError && (
                    <Text size="sm" intent="error">
                        {t("file_upload.error_max_file_size", {size: allowedFileSizeText})}
                    </Text>
                )}
                {fileMutationError && (
                    <Text size="sm" intent="error">
                        {fileMutationError}
                    </Text>
                )}
            </div>
        );
    }

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
                    maxSize={question.allowedFileSize}
                    accept={fileInputAccept}
                    onFileSelect={handleUpload}
                    buttonText={t("file_upload.upload_file")}
                    buttonIntent="primary"
                    buttonVariant="destructive"
                    isLoading={isUploading || isWaitingForRefetch}
                    errorMessages={{
                        fileType: t("file_upload.error_file_type", {types: allowedFileTypesText}),
                        fileSize: t("file_upload.error_max_file_size", {
                            size: allowedFileSizeText,
                        }),
                    }}
                />
                <Text size="sm" intent="secondary">
                    {t("file_upload.allowed_file_types", {
                        types: allowedFileTypesText,
                        size: allowedFileSizeText,
                    })}
                </Text>
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
                        onClick={() => downloadFile(answer.files[0])}
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
                        <Icon name="edit-line" size="xs" color="danger" />
                    </Button>
                    <input
                        ref={fileInputRef}
                        type="file"
                        accept={fileInputAccept.join(",")}
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
