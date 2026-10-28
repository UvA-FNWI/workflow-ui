import {useRef} from "react";

import {Button, Icon, Popover, usePopoverState} from "@uva-fnwi/datanose-ui";

import {MessageThreadPanel} from "./MessageThreadPanel";
import {shouldShowMessageUi} from "./messageVisibility";
import {useTranslate} from "~/hooks/useTranslate";
import {messagesEndpoints} from "~/store/api/messagesApi";

type Props = {
    instanceId: string;
    questionName: string;
    allowMessages?: boolean;
    canAdd: boolean;
};

export function FieldMessageBalloon({instanceId, questionName, allowMessages, canAdd}: Props) {
    const {t} = useTranslate("workflow");
    const triggerRef = useRef<HTMLButtonElement>(null);
    const popover = usePopoverState();
    const {data: threads = [], isSuccess: messagesLoaded} = messagesEndpoints.getMessages.useQuery(
        instanceId,
        {skip: !allowMessages},
    );

    if (!allowMessages) return null;

    const fieldThreads = threads.filter((thread) => thread.questionName === questionName);
    if (!canAdd && !messagesLoaded) return null;
    if (!shouldShowMessageUi(canAdd, fieldThreads.length)) return null;

    const openCount = fieldThreads.filter((thread) => !thread.isClosed).length;
    const label =
        openCount > 0
            ? `${t("instance.messages.field_label")} (${openCount})`
            : t("instance.messages.field_label");

    return (
        <span className="ml-1 inline-flex shrink-0 items-center">
            <Button
                ref={triggerRef}
                intent="ghost"
                size="small"
                shape="circular"
                className="ui:ml-0 ui:border-0 ui:px-1"
                aria-label={label}
                aria-expanded={popover.isOpen}
                onClick={() => (popover.isOpen ? popover.close() : popover.open())}
            >
                <Icon name="bubble-message-line" size="xs" color="current" />
            </Button>
            {openCount > 0 && (
                <span className="text-xs text-grey-600" aria-hidden>
                    {openCount}
                </span>
            )}
            {popover.isOpen && (
                <Popover
                    state={popover}
                    triggerRef={triggerRef}
                    placement="bottom end"
                    className="max-h-96 w-80 overflow-y-auto border border-grey-400 bg-white p-3 shadow-md outline-none dark:bg-grey-800"
                >
                    <MessageThreadPanel
                        instanceId={instanceId}
                        threads={fieldThreads}
                        questionName={questionName}
                        canAdd={canAdd}
                    />
                </Popover>
            )}
        </span>
    );
}
