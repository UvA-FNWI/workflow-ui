import {Button, Heading, Modal, Text} from "@uva-fnwi/datanose-ui";

import {FormModal} from "~/components/instance/FormModal.tsx";
import {FormPage} from "~/components/instance/FormPage.tsx";
import {FormSummary} from "~/components/instance/FormSummary.tsx";
import {FormSummaryAssessment} from "~/components/instance/FormSummaryAssessment.tsx";
import {
    type ContentState,
    getSubmissionsToShow,
    type ModalState,
    resolveFormState,
} from "~/components/instance/resolveContentState.ts";
import {VersionHistory} from "~/components/instance/VersionHistory.tsx";
import {useTranslate} from "~/hooks/useTranslate.ts";
import {actionsEndpoints} from "~/store/api/actionsApi.ts";
import type {Action, WorkflowInstance, WorkflowStep} from "~/store/api/types/instances.ts";
import type {RoleAction, Submission} from "~/store/api/types/submissions.ts";
import {actionIntentToButtonProps} from "~/utils/actionIntentToButtonProps.ts";

type Props = {
    step: WorkflowStep;
    instance: WorkflowInstance;
    actions: Action[];
    submissions: Submission[];
    contentState: ContentState;
    modalState: ModalState;
    activeAction: Action | null;
    resolvedAction: Action | null;
    setActiveAction: (action: Action | null) => void;
};

export const StepCardBody = ({
    step,
    instance,
    actions,
    submissions,
    contentState,
    modalState,
    activeAction,
    resolvedAction,
    setActiveAction,
}: Props) => {
    const {t, l} = useTranslate("workflow");
    const [executeAction] = actionsEndpoints.executeAction.useMutation();

    const submissionsToShow = getSubmissionsToShow(submissions, step);
    const formState = resolveFormState(resolvedAction);
    const showVersionCards = (step.versions?.flatMap((v) => v.submissions ?? []).length ?? 0) > 1;

    const renderBackgroundContent = () => {
        switch (contentState.type) {
            case "empty":
                // Only show empty message when there's no form open either
                if (!formState && actions.length === 0 && !showVersionCards) {
                    return (
                        <div className="pt-4">
                            <Text className="italic">{t("instance.empty_step")}</Text>
                        </div>
                    );
                }
                return null;

            case "submissions":
                return (
                    <>
                        {step.hierarchyMode === "Sequential" && step.children ? (
                            <SequentialSubmissions
                                step={step}
                                submissions={contentState.regular}
                                instanceId={instance.id}
                                permissions={instance.permissions}
                            />
                        ) : (
                            contentState.regular.map((submission) => (
                                <div key={submission.id} className="py-4">
                                    <FormSummary
                                        instanceId={instance.id}
                                        submission={submission}
                                        permissions={instance.permissions}
                                    />
                                </div>
                            ))
                        )}
                        {(contentState.assessments.length > 0 || step.resultsType !== "Normal") && (
                            <FormSummaryAssessment
                                instanceId={instance.id}
                                submissions={contentState.assessments}
                                combine={true}
                                step={step}
                            />
                        )}
                    </>
                );
        }
    };

    // Action buttons show when form is NOT open and actions exist
    const showActionButtons = !formState && actions.length > 0;

    return (
        <>
            <div className="flex flex-col gap-4">
                {/* Background content: submissions or empty */}
                {renderBackgroundContent()}

                {/* Form overlay: shown alongside submissions */}
                {formState && (
                    <div className="py-4">
                        <FormPage
                            instanceId={instance.id}
                            submissionId={formState.action.form ?? ""}
                            onClose={() => setActiveAction(null)}
                        />
                    </div>
                )}

                {/* Action buttons */}
                {showActionButtons && (
                    <div className="flex gap-2 pt-2">
                        {actions.map((a) => (
                            <Button
                                key={a.id}
                                onClick={() => setActiveAction(a)}
                                {...actionIntentToButtonProps(a.intent)}
                            >
                                {l(a.title)}
                            </Button>
                        ))}
                    </div>
                )}

                {/* Version history: always at the bottom */}
                {showVersionCards && (
                    <VersionHistory
                        versions={step.versions ?? []}
                        instanceId={instance.id}
                        defaultExpandFirst={submissionsToShow.length === 0}
                    />
                )}
            </div>

            {/* Confirmation Modal */}
            <Modal
                isOpen={modalState?.type === "confirmationModal"}
                onOpenChange={() => setActiveAction(null)}
            >
                <Modal.Header className="pb-0 text-2xl font-semibold">
                    {activeAction && l(activeAction.title)}
                </Modal.Header>
                <Modal.Body className="mt-2 text-lg">
                    <p>{t("are_you_sure")}</p>
                </Modal.Body>
                {activeAction && (
                    <Modal.Footer>
                        <Button
                            intent="primary"
                            variant="destructive"
                            size="large"
                            onClick={() => {
                                executeAction({
                                    instanceId: instance.id,
                                    name: activeAction.name,
                                    type: activeAction.type,
                                });
                                setActiveAction(null);
                            }}
                        >
                            {t("confirm")}
                        </Button>
                        <Button
                            intent="secondary"
                            variant="destructive"
                            size="large"
                            onClick={() => setActiveAction(null)}
                        >
                            {t("cancel")}
                        </Button>
                    </Modal.Footer>
                )}
            </Modal>

            {/* Form Modal */}
            <FormModal
                isOpen={modalState?.type === "formModal"}
                onClose={() => setActiveAction(null)}
                instanceId={instance.id}
                submissionId={activeAction?.form ?? ""}
            />
        </>
    );
};

/**
 * Renders submissions grouped by child step (for Sequential hierarchyMode).
 */
const SequentialSubmissions = ({
    step,
    submissions,
    instanceId,
    permissions,
}: {
    step: WorkflowStep;
    submissions: Submission[];
    instanceId: string;
    permissions: RoleAction[];
}) => {
    const {l} = useTranslate("workflow");
    const children = step.children ?? [];

    return (
        <>
            {children.map((child) => {
                const childSubmissions = submissions.filter((s) => s.form.step === child.id);
                if (childSubmissions.length === 0) return null;
                return (
                    <div key={child.id} className="flex flex-col gap-2 py-2">
                        <Heading as="h4" size="xs" className="font-semibold">
                            {l(child.title)}
                        </Heading>
                        {childSubmissions.map((submission) => (
                            <div key={submission.id} className="py-2">
                                <FormSummary
                                    instanceId={instanceId}
                                    submission={submission}
                                    permissions={permissions}
                                />
                            </div>
                        ))}
                    </div>
                );
            })}
        </>
    );
};
