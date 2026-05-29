import {type ReactNode, useState} from "react";

import {Button, Heading, Modal, Pill, Skeleton, Text} from "@uva-fnwi/datanose-ui";

import {useTranslate} from "~/hooks/useTranslate";
import {jobsEndpoints} from "~/store/api/jobsApi";
import type {Job, JobStep} from "~/store/api/types/jobs";
import {formatDate} from "~/utils/formatDate";
import {JOB_STATUS_VARIANT} from "~/utils/jobsUtils";

type JobModalProps = {
    jobId: string | null;
    instanceId: string;
    isOpen: boolean;
    onClose: () => void;
};

export const JobModal = ({jobId, instanceId, isOpen, onClose}: JobModalProps) => {
    const {t, i18n} = useTranslate("workflow");
    const [isRunConfirmOpen, setIsRunConfirmOpen] = useState(false);

    const {
        data: job,
        isLoading,
        isError,
    } = jobsEndpoints.getJob.useQuery(
        {instanceId, jobId: jobId ?? ""},
        {
            skip: !isOpen || !jobId,
        },
    );

    const [runJob, {isLoading: isRunning}] = jobsEndpoints.runJob.useMutation();

    const handleRun = () => {
        if (!jobId) {
            return;
        }
        void runJob({instanceId, jobId});
        setIsRunConfirmOpen(false);
    };

    const handleOpenChange = (open: boolean) => {
        if (!open) {
            onClose();
        }
    };

    const title = job?.sourceName ?? job?.sourceType ?? job?.id ?? t("jobs.modal.title");

    return (
        <>
            <Modal isOpen={isOpen} onOpenChange={handleOpenChange} size="xl">
                <Modal.Header>{title}</Modal.Header>
                <Modal.Body className="flex flex-col gap-6">
                    {isLoading && <Skeleton className="h-48 w-full" />}
                    {isError && <Text>{t("jobs.modal.error")}</Text>}
                    {job && <JobDetails job={job} locale={i18n.language} />}
                </Modal.Body>
                <Modal.Footer>
                    <Button
                        intent="primary"
                        size="large"
                        onClick={() => setIsRunConfirmOpen(true)}
                        disabled={!jobId || job?.status === "Running" || isRunning || isLoading}
                    >
                        {t("jobs.modal.run")}
                    </Button>
                    <Button intent="secondary" variant="destructive" size="large" onClick={onClose}>
                        {t("cancel")}
                    </Button>
                </Modal.Footer>
            </Modal>

            <Modal isOpen={isRunConfirmOpen} onOpenChange={setIsRunConfirmOpen} size="sm">
                <Modal.Header>{t("are_you_sure")}</Modal.Header>
                <Modal.Body>
                    <Text>{t("jobs.modal.confirmRunMessage")}</Text>
                </Modal.Body>
                <Modal.Footer>
                    <Button intent="primary" onClick={handleRun} disabled={isRunning}>
                        {t("confirm")}
                    </Button>
                    <Button
                        intent="secondary"
                        variant="destructive"
                        onClick={() => setIsRunConfirmOpen(false)}
                    >
                        {t("cancel")}
                    </Button>
                </Modal.Footer>
            </Modal>
        </>
    );
};

type JobDetailsProps = {
    job: Job;
    locale: string;
};

const JobDetails = ({job, locale}: JobDetailsProps) => {
    const {t} = useTranslate("workflow");

    return (
        <>
            <dl className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <Property label={t("jobs.modal.properties.id")} value={job.id} />
                <Property label={t("jobs.modal.properties.status")}>
                    <Pill variant={JOB_STATUS_VARIANT[job.status]}>{job.status}</Pill>
                </Property>
                <Property label={t("jobs.modal.properties.sourceType")} value={job.sourceType} />
                <Property label={t("jobs.modal.properties.sourceName")} value={job.sourceName} />
                <Property
                    label={t("jobs.modal.properties.startOn")}
                    value={formatDate(job.startOn, locale)}
                />
                <Property
                    label={t("jobs.modal.properties.executedOn")}
                    value={job.executedOn ? formatDate(job.executedOn, locale) : null}
                />
                <Property
                    label={t("jobs.modal.properties.createdBy")}
                    value={job.createdByDisplayName ?? job.createdBy}
                />
                <Property
                    label={t("jobs.modal.properties.isSynchronous")}
                    value={job.isSynchronous ? t("jobs.modal.yes") : t("jobs.modal.no")}
                />
                <Property label={t("jobs.modal.properties.message")} value={job.message} />
                <Property label={t("jobs.modal.properties.workerGroup")} value={job.workerGroup} />
                <Property
                    label={t("jobs.modal.properties.claimedUntil")}
                    value={job.claimedUntil ? formatDate(job.claimedUntil, locale) : null}
                />
                <Property label={t("jobs.modal.properties.instanceId")} value={job.instanceId} />
            </dl>

            <section>
                <Heading as="h3" size="sm" className="mb-3">
                    {t("jobs.modal.steps")}
                </Heading>
                {job.steps && job.steps.length > 0 ? (
                    <ol className="flex flex-col gap-4">
                        {job.steps.map((step, index) => (
                            <JobStepCard key={step.identifier ?? index} step={step} index={index} />
                        ))}
                    </ol>
                ) : (
                    <Text>{t("jobs.modal.noSteps")}</Text>
                )}
            </section>
        </>
    );
};

const Property = ({
    label,
    value,
    children,
}: {
    label: string;
    value?: string | null;
    children?: ReactNode;
}) => (
    <div className="flex flex-col gap-1">
        <dt className="text-sm font-semibold text-grey-700 dark:text-grey-300">{label}</dt>
        <dd className="text-sm">{children ?? (value != null && value !== "" ? value : "—")}</dd>
    </div>
);

const JobStepCard = ({step, index}: {step: JobStep; index: number}) => {
    const {t} = useTranslate("workflow");

    return (
        <li className="rounded border border-grey-300 p-4 dark:border-grey-600">
            <Text className="mb-2 font-semibold">
                {t("jobs.modal.stepNumber", {number: index + 1})}
                {step.identifier ? `: ${step.identifier}` : ""}
            </Text>
            {step.message && (
                <div className="mb-2">
                    <Text className="mb-1 text-sm font-medium text-grey-700 dark:text-grey-300">
                        {t("jobs.modal.stepMessage")}:
                    </Text>
                    <pre className="tmax-h-48 overflow-auto rounded bg-grey-100 p-2 text-xs dark:bg-grey-800">
                        {step.message}
                    </pre>
                </div>
            )}
            {step.outputs && Object.keys(step.outputs).length > 0 && (
                <div>
                    <Text className="mb-1 text-sm font-medium text-grey-700 dark:text-grey-300">
                        {t("jobs.modal.stepOutputs")}:
                    </Text>
                    <pre className="max-h-48 overflow-auto rounded bg-grey-100 p-2 text-xs dark:bg-grey-800">
                        {JSON.stringify(step.outputs, null, 2)}
                    </pre>
                </div>
            )}
        </li>
    );
};
