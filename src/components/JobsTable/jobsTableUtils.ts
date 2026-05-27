import {type PillVariantProps} from "@uva-fnwi/datanose-ui";

import type {JobStatus} from "~/store/api/types/jobs";

export const STATUS_VARIANT: Record<JobStatus, PillVariantProps["variant"]> = {
    Pending: "grey",
    Running: "orange",
    Completed: "green",
    Failed: "red",
};
