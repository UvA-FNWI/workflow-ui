import {useState} from "react";

import {Button, Icon, Modal, Text} from "@uva-fnwi/datanose-ui";

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
    const {data: threads = [], isSuccess: messagesLoaded} = messagesEndpoints.getMessages.useQuery(
        instanceId,
        {skip: !allowMessages},
    );

    if (!allowMessages) return null;

    const fieldThreads = threads.filter((thread) => thread.questionName === questionName);
    if (!canAdd && !messagesLoaded) return null;
    if (!shouldShowMessageUi(canAdd, fieldThreads.length)) return null;

    const openCount = fieldThreads.filter((thread) => !thread.isClosed).length;
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
                    if (!next) setOpen(false);
                }}
                size="md"
            >
                <Modal.Header className="ui:gap-3 [&_h2]:truncate [&>div:first-child]:min-w-0 [&>div:first-child]:flex-1">
                    {t("instance.messages.field_modal_title", {field: fieldLabel})}
                </Modal.Header>
                <Modal.Body className="flex flex-col gap-4">
                    <MessageThreadPanel
                        instanceId={instanceId}
                        threads={fieldThreads}
                        questionName={questionName}
                        canAdd={canAdd}
                    />
                </Modal.Body>
            </Modal>
        </>
    );
}
