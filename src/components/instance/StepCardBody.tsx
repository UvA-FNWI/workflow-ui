import {Button, Heading, Modal, Text} from "@uva-fnwi/datanose-ui";

import {AssessmentOverview} from "~/components/AssessmentOverview/AssessmentOverview.tsx";
import {FormModal} from "~/components/instance/FormModal.tsx";
import {FormPage} from "~/components/instance/FormPage.tsx";
import {FormSummary} from "~/components/instance/FormSummary.tsx";
import {
    type ContentState,
    getCurrentVersionNumber,
    getPreviousFormVersion,
    hasVersionHistory,
    type ModalState,
    resolveFormState,
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
    contentState: ContentState;
    modalState: ModalState;
    activeAction: Action | null;
    resolvedAction: Action | null;
    emptyStateMessage: string | null;
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
    emptyStateMessage,
    setActiveAction,
}: Props) => {
    const {t, l} = useTranslate("workflow");
    const [executeAction] = actionsEndpoints.executeAction.useMutation();

    const formState = resolveFormState(resolvedAction);
    const showVersionCards = hasVersionHistory(step);

    const renderBackgroundContent = () => {
        switch (contentState.type) {
            case "empty":
                return emptyStateMessage ? (
                    <div className="pt-4">
                        <Text className="italic">{emptyStateMessage}</Text>
                    </div>
                ) : null;

            case "submissions":
                return (
                    <>
                        {showVersionCards && (
                            <Heading fontType="heading" size={"sm"} className="font-semibold">
                                {t("version_card.version_nr", {
                                    versionNumber: getCurrentVersionNumber(step),
                                })}
                            </Heading>
                        )}
                        {contentState.regular.map((submission, index) => (
                            <div key={submission.id} className="flex flex-col gap-2 py-4">
                                {index > 0 && (
                                    <Heading
                                        as="h4"
                                        size="xs"
                                        className="pb-1 font-semibold text-red-brand"
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
                        {actions.length > 1 && activeAction != null && (
                            <div className="flex justify-between gap-2">
                                <Text className="uppercase" intent="error" size="xl">
                                    {l(activeAction.title)}
                                </Text>
                                <Button
                                    intent="secondary"
                                    variant="default"
                                    onClick={() => setActiveAction(null)}
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
                            onClose={() => setActiveAction(null)}
                            previousVersion={getPreviousFormVersion(step, formState.action.form)}
                        />
                    </div>
                )}

                {/* Action buttons */}
                {showActionButtons && (
                    <div className="flex flex-wrap gap-2 pt-2">
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
                        defaultExpandFirst={submissions.length === 0}
                    />
                )}
            </div>

            {/* Confirmation Modal */}
            <Modal
                isOpen={modalState?.type === "confirmationModal"}
                onOpenChange={() => setActiveAction(null)}
            >
                <Modal.Header className="pb-0">
                    {activeAction && l(activeAction.title)}
                </Modal.Header>
                <Modal.Body className="mt-2">
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
                previousVersion={getPreviousFormVersion(step, activeAction?.form)}
            />
        </>
    );
};
