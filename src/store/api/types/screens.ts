import type {DataType} from "./submissions";
import type {LocalString} from "~/hooks/useTranslate";
import type {WorkflowDefinition} from "~/store/api/types/workflowDefinitions.ts";

export type ScreenGroup = {
    name: string;
    title: LocalString;
    rows: ScreenRow[];
};

export type ScreenData = {
    name: string;
    workflowDefinition: WorkflowDefinition;
    isBulkEditEnabled: boolean;
    columns: ScreenColumn[];
    rows: ScreenRow[];
    // Present when the screen defines a grouping configuration; rows are then empty.
    groups?: ScreenGroup[];
};

export type ScreenColumnType = "Normal" | "CurrentStep" | "RelatedUsers";

export type ScreenColumn = {
    id: number;
    title: LocalString;
    property?: string;
    filterType: FilterType;
    displayType: DisplayType;
    defaultSort?: SortDirection;
    columnType: ScreenColumnType;
    link: boolean;
    dataType: DataType;
};

export type ScreenRow = {
    id: string;
    values: Record<number, unknown>;
};

export type ScreenRelatedUser = {
    displayName: string;
    roles: LocalString[];
    organisation?: string;
};

export type FilterType = "None" | "Pick";

export type DisplayType = "Normal" | "ExportOnly";

export type SortDirection = "Ascending" | "Descending";
