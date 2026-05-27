export type JobSource = "Action" | "Submit" | "Save";

export type JobStatus = "Pending" | "Completed" | "Failed" | "Running";

export type JobStep = {
    identifier: string | null;
    message: string | null;
    outputs: Record<string, unknown> | null;
};

export type Job = {
    id: string | null;
    instanceId: string | null;
    sourceType: JobSource;
    sourceName: string | null;
    startOn: string;
    createdBy: string | null;
    createdByDisplayName: string | null;
    executedOn: string | null;
    status: JobStatus;
    steps: JobStep[] | null;
    isSynchronous: boolean;
    message: string | null;
    workerGroup: string | null;
    claimedUntil: string | null;
};
