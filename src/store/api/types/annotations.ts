/// Position shape emitted by react-pdf-highlighter.
/// Stored verbatim in MongoDB and round-tripped as JSON.
export type BoundingRect = {
    x1: number;
    y1: number;
    x2: number;
    y2: number;
    width: number;
    height: number;
    pageNumber?: number;
};

export type HighlightPosition = {
    boundingRect: BoundingRect;
    rects: BoundingRect[];
    pageNumber: number;
};

export type Annotation = {
    id: string;
    highlightedText: string;
    comment: string;
    position: HighlightPosition;
};

export type CreateAnnotationBody = {
    highlightedText: string;
    comment: string;
    position: HighlightPosition;
};
