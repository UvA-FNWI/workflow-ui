import {useState} from "react";

import {Button, Disclosure, Heading, Icon, Pill} from "@uva-fnwi/datanose-ui";

import {MessageThreadPanel} from "./MessageThreadPanel";
import {shouldShowMessageUi} from "./messageVisibility";
import {useTranslate} from "~/hooks/useTranslate";
import {messagesEndpoints} from "~/store/api/messagesApi";
import type {WorkflowInstance} from "~/store/api/types/instances";

type Props = {
    instance: WorkflowInstance;
};

export function CommentsCard({instance}: Props) {
    const {t} = useTranslate("workflow");
    const enabled = instance.workflowDefinition.messagesEnabled === true;
    const {data: threads = [], isSuccess: messagesLoaded} = messagesEndpoints.getMessages.useQuery(
        instance.id,
        {skip: !enabled},
    );
    const [expanded, setExpanded] = useState(false);
    const [focusNewConversation, setFocusNewConversation] = useState(false);

    if (!enabled) return null;

    const instanceThreads = threads.filter((thread) => thread.questionName == null);
    const canAdd = instance.permissions.includes("AddInstanceMessage");
    if (!canAdd && !messagesLoaded) return null;
    if (!shouldShowMessageUi(canAdd, instanceThreads.length)) return null;

    const closedCount = instanceThreads.filter((thread) => thread.isClosed).length;
    const openCount = instanceThreads.length - closedCount;
    const title = t("instance.messages.heading", {
        title: t("instance.messages.title"),
        audience: t("instance.messages.audience"),
    });
    const threadSummary =
        openCount > 0
            ? t("instance.messages.summary_open", {count: openCount})
            : closedCount > 0
              ? t("instance.messages.summary_closed", {count: closedCount})
              : null;

    return (
        <Disclosure
            isExpanded={expanded}
            onExpandedChange={(open) => {
                setExpanded(open);
                if (!open) setFocusNewConversation(false);
            }}
        >
            <div className="flex flex-row items-center justify-between">
                <Disclosure.Header>
                    <div className="flex min-w-0 flex-wrap items-center gap-2">
                        <Heading className="font-semibold">{title}</Heading>
                        {threadSummary && (
                            <Pill variant={openCount > 0 ? "red" : "grey"}>{threadSummary}</Pill>
                        )}
                    </div>
                </Disclosure.Header>
                {canAdd && (
                    <div className="pr-6">
                        <Button
                            intent="secondary"
                            variant="destructive"
                            size="square"
                            width="none"
                            className="flex items-center justify-center leading-0"
                            aria-label={t("instance.messages.add")}
                            onClick={() => {
                                setExpanded(true);
                                setFocusNewConversation(true);
                            }}
                        >
                            <Icon name="plus-solid" color="current" />
                        </Button>
                    </div>
                )}
            </div>
            <Disclosure.Content>
                <div className="flex flex-col gap-3 pt-2">
                    <MessageThreadPanel
                        instanceId={instance.id}
                        threads={instanceThreads}
                        canAdd={canAdd}
                        focusNewConversation={focusNewConversation}
                        onFocusNewConversationHandled={() => setFocusNewConversation(false)}
                    />
                </div>
            </Disclosure.Content>
        </Disclosure>
    );
}
