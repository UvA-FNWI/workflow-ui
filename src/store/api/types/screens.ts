import type {IconType} from "@uva-fnwi/datanose-ui";

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
    bulkActions?: BulkAction[];
};

export type BulkAction = {
    action: string;
    label: LocalString;
    icon: {type: IconType};
};

export type BulkActionParams = {
    workflowDefinition: string;
    screenName: string;
    actionName: string;
    instanceIds: string[];
};

export type BulkActionResult = {
    rows: {instanceId: string; status: "Eligible" | "Unavailable" | "Succeeded" | "Failed"}[];
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
