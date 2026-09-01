const DEFAULT_ALLOWED_FILE_TYPES = ["pdf"];
const DEFAULT_ALLOWED_FILE_SIZE = 10_000_000;

export const getAllowedFileTypes = (allowedFileTypes?: string[]): string[] => {
    const fileTypes = allowedFileTypes?.length ? allowedFileTypes : DEFAULT_ALLOWED_FILE_TYPES;

    const normalized = [
        ...new Set(
            fileTypes.map((fileType) => {
                const normalized = fileType.trim().toLowerCase();
                return normalized.replace(/^\.+/, "");
            }),
        ),
    ];

    return normalized;
};

export const formatAllowedFileTypes = (allowedFileTypes: string[]): string =>
    allowedFileTypes.map((fileType) => fileType.toUpperCase()).join(", ");

export const toFileInputAccept = (allowedFileTypes: string[]): string[] =>
    allowedFileTypes.map((fileType) => `.${fileType}`);

export const getAllowedFileSize = (allowedFileSize?: number): number =>
    allowedFileSize && allowedFileSize > 0 ? allowedFileSize : DEFAULT_ALLOWED_FILE_SIZE;

export const formatAllowedFileSize = (bytes: number): string => {
    if (bytes < 1000) return `${bytes} B`;
    if (bytes < 1_000_000) return `${bytes / 1000} KB`;

    return `${bytes / 1_000_000} MB`;
};
