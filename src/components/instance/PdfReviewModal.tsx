import {useState} from "react";

import {
    AreaHighlight,
    MonitoredHighlightContainer,
    PdfHighlighter,
    PdfLoader,
    TextHighlight,
    useHighlightContainerContext,
    usePdfHighlighterContext,
} from "react-pdf-highlighter-extended";
import type {GhostHighlight, Highlight, ScaledPosition, Tip} from "react-pdf-highlighter-extended";

import {Button, Modal} from "@datanose/ui";

import {useCreateAnnotationMutation, useGetAnnotationsQuery} from "~/store/api/annotationsApi";
import type {HighlightPosition} from "~/store/api/types/annotations";
import type {StoredFile} from "~/store/api/types/submissions";
import {generateFileDownloadUrl} from "~/utils/fileDownload";

interface AnnotationHighlight extends Highlight {
    comment: string;
}

type Props = {
    file: StoredFile;
    questionName: string;
    instanceId: string;
    submissionId: string;
    isOpen: boolean;
    onClose: () => void;
};

const HighlightPopup = ({comment}: {comment: string}) =>
    comment ? <div className="Highlight__popup">{comment}</div> : null;

const SelectionTip = ({
    onConfirm,
}: {
    onConfirm: (ghost: GhostHighlight, comment: string) => void;
}) => {
    const [comment, setComment] = useState("");
    const {getCurrentSelection} = usePdfHighlighterContext();

    return (
        <div className="flex flex-col gap-2 rounded-md bg-white p-3 shadow-lg ring-1 ring-black/10">
            <input
                className="rounded border border-gray-300 px-2 py-1 text-sm outline-none focus:border-black"
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Add a comment…"
            />
            <Button
                intent="primary"
                size="small"
                onClick={() => {
                    const selection = getCurrentSelection();
                    if (selection) {
                        onConfirm(selection.makeGhostHighlight(), comment);
                    }
                }}
            >
                Save
            </Button>
        </div>
    );
};

const HighlightContainer = ({
    onAreaChange,
}: {
    onAreaChange: (text: string, comment: string, position: HighlightPosition) => void;
}) => {
    const {highlight, isScrolledTo, viewportToScaled} =
        useHighlightContainerContext<AnnotationHighlight>();
    const isTextHighlight = !highlight.content?.image;

    const highlightTip: Tip = {
        position: highlight.position,
        content: (
            <div className="rounded-md bg-white px-3 py-2 text-sm shadow-lg ring-1 ring-black/10">
                <HighlightPopup comment={highlight.comment} />
            </div>
        ),
    };

    return (
        <MonitoredHighlightContainer highlightTip={highlightTip}>
            {isTextHighlight ? (
                <TextHighlight highlight={highlight} isScrolledTo={isScrolledTo} />
            ) : (
                <AreaHighlight
                    isScrolledTo={isScrolledTo}
                    highlight={highlight}
                    onChange={(boundingRect) =>
                        onAreaChange(highlight.content?.text ?? "", highlight.comment, {
                            boundingRect: viewportToScaled(boundingRect),
                            rects: [],
                            pageNumber: boundingRect.pageNumber,
                        })
                    }
                />
            )}
        </MonitoredHighlightContainer>
    );
};

export const PdfReviewModal = ({
    file,
    questionName,
    instanceId,
    submissionId,
    isOpen,
    onClose,
}: Props) => {
    const pdfUrl = generateFileDownloadUrl(file, questionName, instanceId, submissionId);

    const {data: annotations = []} = useGetAnnotationsQuery(
        {instanceId, submissionId, questionName, artifactId: file.id},
        {skip: !isOpen},
    );

    const [createAnnotation] = useCreateAnnotationMutation();

    const highlights: AnnotationHighlight[] = annotations.map((a) => ({
        id: a.id,
        content: {text: a.highlightedText},
        comment: a.comment,
        position: a.position as unknown as ScaledPosition,
    }));

    const addHighlight = async (ghostHighlight: GhostHighlight, comment: string) => {
        await createAnnotation({
            instanceId,
            submissionId,
            questionName,
            artifactId: file.id,
            body: {
                highlightedText: ghostHighlight.content.text ?? "",
                comment,
                position: ghostHighlight.position as unknown as HighlightPosition,
            },
        });
    };

    const handleAreaChange = async (text: string, comment: string, position: HighlightPosition) => {
        await createAnnotation({
            instanceId,
            submissionId,
            questionName,
            artifactId: file.id,
            body: {highlightedText: text, comment, position},
        });
    };

    return (
        <Modal isOpen={isOpen} onOpenChange={onClose} size="full">
            <Modal.Header>{file.name}</Modal.Header>
            <Modal.Body className="p-0">
                <div style={{height: "70vh", position: "relative"}}>
                    <PdfLoader
                        document={pdfUrl}
                        beforeLoad={() => <div className="p-4">Loading PDF…</div>}
                    >
                        {(pdfDocument) => (
                            <PdfHighlighter
                                pdfScaleValue="page-actual"
                                pdfDocument={pdfDocument}
                                highlights={highlights}
                                enableAreaSelection={(event) => event.altKey}
                                onScrollAway={() => {}}
                                utilsRef={() => {}}
                                selectionTip={<SelectionTip onConfirm={addHighlight} />}
                            >
                                <HighlightContainer onAreaChange={handleAreaChange} />
                            </PdfHighlighter>
                        )}
                    </PdfLoader>
                </div>
            </Modal.Body>
        </Modal>
    );
};
