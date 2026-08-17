import {VITE_WEBAPI_URL} from "~/helpers/Environment";
import type {StoredFile} from "~/store/api/types/submissions";

/**
 * Generate the download URL for a stored file
 * @param storedFile - The stored file object containing id and accessToken
 * @param questionName - The name of the question
 * @param instanceId - The instance ID
 * @param submissionId - The submission ID (can be the same as instanceId if using single-level path)
 * @returns The constructed download URL
 */
export const generateFileDownloadUrl = (
    storedFile: StoredFile,
    questionName: string,
    instanceId: string,
    submissionId?: string,
) =>
    `${VITE_WEBAPI_URL}/Answers/${instanceId}/${submissionId}/${questionName}/Artifacts/${storedFile.id}?token=${storedFile.accessToken}`;

/**
 * Open a file download in a new tab
 * @param storedFile - The stored file object containing id and accessToken
 * @param questionName - The name of the question
 * @param instanceId - The instance ID
 * @param submissionId - The submission ID (can be the same as instanceId if using single-level path)
 */
export function downloadFile(file: Blob, fileName: string): void;
export function downloadFile(
    storedFile: StoredFile | undefined,
    questionName: string,
    instanceId: string,
    submissionId?: string,
): void;
export function downloadFile(
    storedFile: StoredFile | Blob | undefined,
    questionName: string,
    instanceId?: string,
    submissionId?: string,
): void {
    if (storedFile instanceof Blob) {
        const url = URL.createObjectURL(storedFile);
        const link = document.createElement("a");
        link.href = url;
        link.download = questionName;
        link.click();
        setTimeout(() => URL.revokeObjectURL(url), 0);
        return;
    }
    if (!storedFile || !VITE_WEBAPI_URL) return;
    const url = generateFileDownloadUrl(storedFile, questionName, instanceId!, submissionId);
    window.open(url, "_blank", "noopener,noreferrer");
}
