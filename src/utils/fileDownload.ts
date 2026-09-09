import {VITE_WEBAPI_URL} from "~/helpers/Environment";
import type {StoredFile} from "~/store/api/types/submissions";

/**
 * Generate the download URL for a stored artifact
 * @param storedFile - The stored file object containing the artifact ID and access token
 * @returns The artifact download URL
 */
export const generateFileDownloadUrl = (storedFile: StoredFile) =>
    `${VITE_WEBAPI_URL}/Artifacts/${storedFile.id}?token=${storedFile.accessToken}`;

/**
 * Open a stored artifact download in a new tab
 * @param storedFile - The stored file object containing the artifact ID and access token
 */
export function downloadFile(storedFile: StoredFile | undefined): void {
    if (!storedFile || !VITE_WEBAPI_URL) return;

    window.open(generateFileDownloadUrl(storedFile), "_blank", "noopener,noreferrer");
}
