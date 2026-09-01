export const formatAllowedFileTypes = (allowedFileTypes: string[], language: string): string =>
    new Intl.ListFormat(language === "nl" ? "nl" : "en-GB", {
        style: "long",
        type: "disjunction",
    }).format(allowedFileTypes.map((fileType) => fileType.toUpperCase()));

export const toFileInputAccept = (allowedFileTypes: string[]): string[] =>
    allowedFileTypes.map((fileType) => `.${fileType}`);

export const formatAllowedFileSize = (bytes: number): string => {
    if (bytes < 1000) return `${bytes}B`;
    if (bytes < 1_000_000) return `${bytes / 1000}KB`;

    return `${bytes / 1_000_000}MB`;
};
