import {useState} from "react";

import {Button, Icon, Modal} from "@uva-fnwi/datanose-ui";

import {type MessageUiSettings, useMessageTerms} from "./instanceMessageSettings";
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
    canView: boolean;
    messageUi?: MessageUiSettings;
};

export function FieldMessageBalloon({
    instanceId,
    questionName,
    fieldLabel,
    allowMessages,
    canAdd,
    canView,
    messageUi,
}: Props) {
    const {t} = useTranslate("workflow");
    const terms = useMessageTerms(messageUi);
    const [open, setOpen] = useState(false);
    const {data: threads = [], isSuccess: messagesLoaded} = messagesEndpoints.getMessages.useQuery(
        instanceId,
        {skip: !allowMessages || !canView},
    );

    if (!allowMessages || !canView) return null;

    const fieldThreads = threads.filter((thread) => thread.questionName === questionName);
    if (!canAdd && !messagesLoaded) return null;
    if (!shouldShowMessageUi(canAdd, fieldThreads.length)) return null;

    const hasNotes = fieldThreads.length > 0;
    const modalTitle = t("instance.messages.field_modal_title", {...terms, field: fieldLabel});

    const triggerClassName =
        "ui:border-0 ui:px-1 ui:align-middle ui:hover:enabled:bg-grey-100 ui:dark:hover:enabled:bg-grey-800";

    return (
        <>
            <span className="inline-flex shrink-0 items-center">
                <Button
                    intent="ghost"
                    size="small"
                    shape="circular"
                    className={triggerClassName}
                    aria-label={t("instance.messages.field_label", terms)}
                    aria-expanded={open}
                    onClick={() => setOpen(true)}
                >
                    <Icon
                        name={hasNotes ? "bubble-message-solid" : "bubble-message-line"}
                        size="xs"
                        color="danger"
                        decorative
                    />
                </Button>
            </span>
            <Modal
                isOpen={open}
                onOpenChange={(next) => {
                    if (!next) setOpen(false);
                }}
                size="md"
                aria-label={modalTitle}
            >
                <Modal.Header className="ui:gap-3 [&_h2]:truncate [&>div:first-child]:min-w-0 [&>div:first-child]:flex-1">
                    {modalTitle}
                </Modal.Header>
                <Modal.Body className="flex flex-col gap-4">
                    <MessageThreadPanel
                        instanceId={instanceId}
                        threads={fieldThreads}
                        questionName={questionName}
                        canAdd={canAdd}
                        showNewComposer
                        onDismissComposer={(reason) => {
                            if (reason === "cancel") setOpen(false);
                        }}
                        messageUi={messageUi}
                    />
                </Modal.Body>
            </Modal>
        </>
    );
}
