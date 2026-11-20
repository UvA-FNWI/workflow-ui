import {useEffect} from "react";

import {Button, Heading, Icon, Text} from "@uva-fnwi/datanose-ui";

import {AssessmentOverview} from "~/components/AssessmentOverview/AssessmentOverview.tsx";
import {ActionModal} from "~/components/instance/ActionModal.tsx";
import {FormPage} from "~/components/instance/FormPage.tsx";
import {FormSummary} from "~/components/instance/FormSummary.tsx";
import {resolveInstanceMessageSettings} from "~/components/instance/instanceMessageSettings.ts";
import {
    type ContentState,
    getPreviousFormVersion,
    getStepHierarchy,
    hasVersionHistory,
    type ModalState,
    resolveFormState,
} from "~/components/instance/resolveContentState.ts";
import {VersionHistory} from "~/components/instance/VersionHistory.tsx";
import {useTranslate} from "~/hooks/useTranslate.ts";
import type {Action, WorkflowInstance, WorkflowStep} from "~/store/api/types/instances.ts";
import type {Submission} from "~/store/api/types/submissions.ts";
import {setOpenForm} from "~/store/openFormSlice.ts";
import {useAppDispatch} from "~/store/store.ts";
import {actionIntentToButtonProps} from "~/utils/actionIntentToButtonProps.ts";
import {hasSubmissionContent} from "~/utils/submissionUtils.ts";

type Props = {
    step: WorkflowStep;
    showChildHistory?: boolean;
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
    showChildHistory = true,
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
    const dispatch = useAppDispatch();

    const formState = resolveFormState(resolvedAction);
    const openFormId = formState?.action.form;
    const canAddMessages = (instance.permissions ?? []).includes("AddMessages");
    const canViewMessages = (instance.permissions ?? []).includes("ViewMessages");
    const messageUi = resolveInstanceMessageSettings(instance.workflowDefinition) ?? undefined;

    // Modal forms must not replace the step form registered for the admin helper.
    useEffect(() => {
        if (!openFormId) return;
        dispatch(setOpenForm({formId: openFormId, instanceId: instance.id}));
        return () => {
            dispatch(setOpenForm({formId: null, instanceId: instance.id}));
        };
    }, [openFormId, instance.id, dispatch]);

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
                        {contentState.regular.map((submission) => (
                            <div key={submission.id} className="flex flex-col gap-2">
                                <Heading
                                    as="h3"
                                    size="xs"
                                    className="py-4 pb-1 font-semibold text-red-brand"
                                >
                                    {l(submission.form.title)?.toUpperCase()}
                                </Heading>
                                <FormSummary
                                    instanceId={instance.id}
                                    submission={submission}
                                    canAddMessages={canAddMessages}
                                    canViewMessages={canViewMessages}
                                    messageUi={messageUi}
                                />
                            </div>
                        ))}
                        {(contentState.assessments.length > 0 || step.resultsType !== "Normal") && (
                            <AssessmentOverview
                                instanceId={instance.id}
                                submissions={contentState.assessments}
                                combine={true}
                                step={step}
                                emptyMessage={emptyStateMessage}
                                canAddMessages={canAddMessages}
                                canViewMessages={canViewMessages}
                                messageUi={messageUi}
                            />
                        )}
                    </>
                );
        }
    };

    const versionHeading =
        step.versions?.current && step.versions.history.length > 0 ? (
            <Heading fontType="heading" size="sm" as="h3" className="pt-4 font-semibold">
                {t("version_card.version_nr", {versionNumber: step.versions.current.versionNumber})}
            </Heading>
        ) : null;

    // Action buttons show when form is NOT open and actions exist
    const showActionButtons = !formState && actions.length > 0;

    return (
        <>
            <div className="flex flex-col gap-4">
                {!formState &&
                    step.versions?.current?.submissions.some(hasSubmissionContent) &&
                    versionHeading}
                {/* Background content: submissions or empty */}
                {renderBackgroundContent()}

                {/* Form overlay: shown alongside submissions */}
                {formState && (
                    <div className="py-4">
                        {versionHeading}
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
                            canAddMessages={canAddMessages}
                            canViewMessages={canViewMessages}
                            messageUi={messageUi}
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
                <VersionHistory
                    versions={step.versions?.history ?? []}
                    instanceId={instance.id}
                    defaultExpandFirst={!submissions.some(hasSubmissionContent)}
                />
                {showChildHistory &&
                    getStepHierarchy(step)
                        .slice(1)
                        .filter(
                            (child) =>
                                child.versions?.current?.submissions.some(hasSubmissionContent) ||
                                hasVersionHistory(child),
                        )
                        .map((child) => (
                            <section key={child.id} className="pt-4">
                                <Heading as="h3" size="sm">
                                    {l(child.title)}
                                </Heading>
                                <VersionHistory
                                    versions={[
                                        ...(child.versions?.current
                                            ? [child.versions.current]
                                            : []),
                                        ...(child.versions?.history ?? []),
                                    ]}
                                    instanceId={instance.id}
                                    defaultExpandFirst={false}
                                />
                            </section>
                        ))}
            </div>

            {modalState && (
                <ActionModal
                    key={modalState.action.id}
                    action={modalState.action}
                    onClose={() => setActiveAction(null)}
                    instanceId={instance.id}
                    previousVersion={getPreviousFormVersion(step, modalState.action.form)}
                />
            )}
        </>
    );
};
