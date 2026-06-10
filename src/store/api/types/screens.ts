import type {DataType} from "./submissions";
import type {LocalString} from "~/hooks/useTranslate";

export type GroupedScreen = {
    name: string;
    entityType: string;
    columns: ScreenColumn[];
    groups: ScreenGroup[];
};
export type ScreenGroup = {
    name: string;
    title: LocalString;
    rows: ScreenRow[];
};
export type Screen = {
    name: string;
    entityType: string;
    columns: ScreenColumn[];
    rows: ScreenRow[];
};

export type ScreenData = {
    name: string;
    workflowDefinition: string;
    columns: ScreenColumn[];
    rows: ScreenRow[];
};

export type ScreenColumn = {
    id: number;
    title: LocalString;
    property?: string;
    filterType: FilterType;
    displayType: DisplayType;
    defaultSort?: SortDirection;
    isCurrentStep: boolean;
    link: boolean;
    dataType: DataType;
};

export type ScreenRow = {
    id: string;
    values: Record<number, unknown>;
};

export type FilterType = "None" | "Pick";

export type DisplayType = "Normal" | "ExportOnly";

export type SortDirection = "Ascending" | "Descending";
