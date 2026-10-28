import {useState} from "react";

import {Button, Icon, Modal, Text} from "@uva-fnwi/datanose-ui";

import {ClosedCommentsToggle} from "./ClosedCommentsToggle";
import {MessageThreadPanel} from "./MessageThreadPanel";
import {shouldShowMessageUi} from "./messageVisibility";
import {useTranslate} from "~/hooks/useTranslate";
import {messagesEndpoints} from "~/store/api/messagesApi";

type Props = {
    instanceId: string;
    questionName: string;
    fieldLabel: string;
    allowMessages?: boolean;
    canAdd: boolean;
};

export function FieldMessageBalloon({
    instanceId,
    questionName,
    fieldLabel,
    allowMessages,
    canAdd,
}: Props) {
    const {t} = useTranslate("workflow");
    const [open, setOpen] = useState(false);
    const [showClosed, setShowClosed] = useState(false);
    const {data: threads = [], isSuccess: messagesLoaded} = messagesEndpoints.getMessages.useQuery(
        instanceId,
        {skip: !allowMessages},
    );

    if (!allowMessages) return null;

    const fieldThreads = threads.filter((thread) => thread.questionName === questionName);
    if (!canAdd && !messagesLoaded) return null;
    if (!shouldShowMessageUi(canAdd, fieldThreads.length)) return null;

    const openCount = fieldThreads.filter((thread) => !thread.isClosed).length;
    const closedCount = fieldThreads.length - openCount;
    const hasAnyComments = fieldThreads.length > 0;
    const iconColor = hasAnyComments ? ("danger" as const) : ("current" as const);

    const ariaLabel =
        openCount > 0
            ? `${t("instance.messages.field_label")} (${openCount})`
            : t("instance.messages.field_label");

    const triggerClassName =
        "ui:ml-1 ui:border-0 ui:px-1 ui:align-middle ui:hover:enabled:bg-grey-100 ui:dark:hover:enabled:bg-grey-800";

    return (
        <>
            <span className="inline-flex shrink-0 items-center">
                <Button
                    intent="ghost"
                    size="small"
                    shape="circular"
                    className={triggerClassName}
                    aria-label={ariaLabel}
                    aria-expanded={open}
                    onClick={() => setOpen(true)}
                >
                    <Icon name="bubble-message-line" size="xs" color={iconColor} />
                </Button>
                {openCount > 0 && (
                    <Text as="span" size="xs" intent="error" display="inline" aria-hidden>
                        {openCount}
                    </Text>
                )}
            </span>
            <Modal
                isOpen={open}
                onOpenChange={(next) => {
                    if (!next) {
                        setOpen(false);
                        setShowClosed(false);
                    }
                }}
                size="sm"
            >
                <Modal.Header>
                    {t("instance.messages.field_modal_title", {field: fieldLabel})}
                </Modal.Header>
                <Modal.Body className="flex flex-col gap-4">
                    <ClosedCommentsToggle
                        closedCount={closedCount}
                        showClosed={showClosed}
                        onChange={setShowClosed}
                    />
                    <MessageThreadPanel
                        instanceId={instanceId}
                        threads={fieldThreads}
                        questionName={questionName}
                        canAdd={canAdd}
                        showClosed={showClosed}
                        onShowClosedChange={setShowClosed}
                        showNewComposer={canAdd && openCount === 0}
                    />
                </Modal.Body>
                <Modal.Footer>
                    <Button size="large" intent="secondary" onClick={() => setOpen(false)}>
                        {t("cancel")}
                    </Button>
                </Modal.Footer>
            </Modal>
        </>
    );
}
