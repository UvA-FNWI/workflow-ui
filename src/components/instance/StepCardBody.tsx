import {Button, Heading, Icon, Modal, Text} from "@uva-fnwi/datanose-ui";

import {AssessmentOverview} from "~/components/AssessmentOverview/AssessmentOverview.tsx";
import {FormModal} from "~/components/instance/FormModal.tsx";
import {FormPage} from "~/components/instance/FormPage.tsx";
import {FormSummary} from "~/components/instance/FormSummary.tsx";
import {
    type FormState,
    getPreviousFormVersion,
    resolveContentState,
    resolveModalState,
} from "~/components/instance/resolveContentState.ts";
import {VersionHistory} from "~/components/instance/VersionHistory.tsx";
import {useTranslate} from "~/hooks/useTranslate.ts";
import {actionsEndpoints} from "~/store/api/actionsApi.ts";
import type {Action, WorkflowInstance, WorkflowStep} from "~/store/api/types/instances.ts";
import type {Submission} from "~/store/api/types/submissions.ts";
import {actionIntentToButtonProps} from "~/utils/actionIntentToButtonProps.ts";

type Props = {
    step: WorkflowStep;
    instance: WorkflowInstance;
    actions: Action[];
    submissions: Submission[];
    activeAction: Action | null;
    formState: FormState;
    emptyStateMessage: string | null;
    onSelectAction: (action: Action | null) => void;
};

export const StepCardBody = ({
    step,
    instance,
    actions,
    submissions,
    activeAction,
    formState,
    emptyStateMessage,
    onSelectAction,
}: Props) => {
    const {t, l} = useTranslate("workflow");
    const close = () => onSelectAction(null);

    const contentState = resolveContentState(step, submissions);
    const modalState = resolveModalState(activeAction);

    const currentVersion = step.versions?.current?.versionNumber;
    const versionHeading = currentVersion != null && (
        <Heading fontType="heading" size="sm" as="h3" className="pt-4 font-semibold">
            {t("version_card.version_nr", {versionNumber: currentVersion})}
        </Heading>
    );

    return (
        <>
            <div className="flex flex-col gap-4">
                {/* Submissions or empty */}
                {contentState.type === "empty" ? (
                    emptyStateMessage && (
                        <div className="pt-4">
                            <Text className="italic">{emptyStateMessage}</Text>
                        </div>
                    )
                ) : (
                    <>
                        {contentState.regular.map((submission) => (
                            <div key={submission.id} className="flex flex-col gap-2">
                                {contentState.regular.length > 0 && (
                                    <Heading
                                        as="h3"
                                        size="xs"
                                        className="py-4 pb-1 font-semibold text-red-brand"
                                    >
                                        {l(submission.form.title)?.toUpperCase()}
                                    </Heading>
                                )}
                                <FormSummary instanceId={instance.id} submission={submission} />
                            </div>
                        ))}
                        {(contentState.assessments.length > 0 || step.resultsType !== "Normal") && (
                            <AssessmentOverview
                                instanceId={instance.id}
                                submissions={contentState.assessments}
                                combine={true}
                                step={step}
                                emptyMessage={emptyStateMessage}
                            />
                        )}
                    </>
                )}

                {/* Form or action buttons */}
                {formState ? (
                    <div className="py-4">
                        {formState && versionHeading}
                        {actions.length > 1 && activeAction != null && (
                            <div className="flex justify-between gap-2">
                                <Text className="uppercase" intent="error" size="xl">
                                    {l(activeAction.title)}
                                </Text>
                                <Button
                                    intent="secondary"
                                    variant="default"
                                    onClick={() => onSelectAction(null)}
                                    className="mb-4"
                                    leftIcon={<Icon name="rotate-left-solid" color="current" />}
                                >
                                    {t("change_selection")}
                                </Button>
                            </div>
                        )}
                        <FormPage
                            key={formState.action.form}
                            instanceId={instance.id}
                            submissionId={formState.action.form ?? ""}
                            onClose={() => onSelectAction(null)}
                            previousVersion={getPreviousFormVersion(step, formState.action.form)}
                        />
                    </div>
                ) : (
                    <ActionButtons actions={actions} onSelect={onSelectAction} />
                )}

                <VersionHistory
                    versions={step.versions?.history ?? []}
                    instanceId={instance.id}
                    defaultExpandFirst={submissions.length === 0}
                />
            </div>

            <ConfirmActionModal
                action={modalState?.type === "confirmationModal" ? modalState.action : null}
                instanceId={instance.id}
                onClose={close}
            />
            <FormModal
                isOpen={modalState?.type === "formModal"}
                onClose={close}
                instanceId={instance.id}
                submissionId={activeAction?.form ?? ""}
                previousVersion={getPreviousFormVersion(step, activeAction?.form)}
            />
        </>
    );
};

const ActionButtons = ({
    actions,
    onSelect,
}: {
    actions: Action[];
    onSelect: (action: Action) => void;
}) => {
    const {l} = useTranslate("workflow");
    if (actions.length === 0) return null;

    return (
        <div className="flex flex-wrap gap-2 pt-2">
            {actions.map((action) => (
                <Button
                    key={action.id}
                    onClick={() => onSelect(action)}
                    {...actionIntentToButtonProps(action.intent)}
                >
                    {l(action.title)}
                </Button>
            ))}
        </div>
    );
};

const ConfirmActionModal = ({
    action,
    instanceId,
    onClose,
}: {
    action: Action | null;
    instanceId: string;
    onClose: () => void;
}) => {
    const {t, l} = useTranslate("workflow");
    const [executeAction] = actionsEndpoints.executeAction.useMutation();

    return (
        <Modal isOpen={action != null} onOpenChange={(open) => !open && onClose()}>
            <Modal.Header className="pb-0">{action && l(action.title)}</Modal.Header>
            <Modal.Body className="mt-2">
                <p>{t("are_you_sure")}</p>
            </Modal.Body>
            {action && (
                <Modal.Footer>
                    <Button
                        intent="primary"
                        variant="destructive"
                        size="large"
                        onClick={() => {
                            executeAction({instanceId, name: action.name, type: action.type});
                            onClose();
                        }}
                    >
                        {t("confirm")}
                    </Button>
                    <Button intent="secondary" variant="destructive" size="large" onClick={onClose}>
                        {t("cancel")}
                    </Button>
                </Modal.Footer>
            )}
        </Modal>
    );
};
