import {useState} from "react";

import {Button, Link} from "@datanose/ui";

import {PdfReviewModal} from "~/components/instance/PdfReviewModal";
import type {StoredFile} from "~/store/api/types/submissions.ts";
import {downloadFile} from "~/utils/fileDownload";

type Props = {
    file: StoredFile;
    formattedValue: string | undefined;
    questionName: string;
    instanceId: string;
    submissionId: string;
};

export const FileAnswer = ({
    file,
    formattedValue,
    questionName,
    instanceId,
    submissionId,
}: Props) => {
    const [isReviewing, setIsReviewing] = useState(false);
    const isPdf = file.name.toLowerCase().endsWith(".pdf");

    return (
        <div className="flex items-center gap-2">
            <Link
                intent="primary"
                underline
                className="truncate"
                onClick={() => downloadFile(file, questionName, instanceId, submissionId)}
            >
                {formattedValue}
            </Link>
            {isPdf && (
                <Button intent="secondary" size="small" onClick={() => setIsReviewing(true)}>
                    Review
                </Button>
            )}
            {isPdf && isReviewing && (
                <PdfReviewModal
                    file={file}
                    questionName={questionName}
                    instanceId={instanceId}
                    submissionId={submissionId}
                    isOpen
                    onClose={() => setIsReviewing(false)}
                />
            )}
        </div>
    );
};
