import {useState} from "react";

import {Button, Callout, Disclosure, Heading, Icon, Pill} from "@uva-fnwi/datanose-ui";

import {resolveInstanceMessageSettings} from "./instanceMessageSettings";
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
    const messageSettings = resolveInstanceMessageSettings(instance.workflowDefinition);
    const canView = instance.permissions.includes("ViewMessages");
    const {data: threads = [], isSuccess: messagesLoaded} = messagesEndpoints.getMessages.useQuery(
        instance.id,
        {skip: !messageSettings || !canView},
    );
    const [expanded, setExpanded] = useState(false);
    const [focusNewConversation, setFocusNewConversation] = useState(false);

    if (!messageSettings?.card || !canView) return null;

    const instanceThreads = threads.filter((thread) => thread.questionName == null);
    const canAdd = instance.permissions.includes("AddMessages");
    if (!canAdd && !messagesLoaded) return null;
    if (!shouldShowMessageUi(canAdd, instanceThreads.length)) return null;

    const closedCount = instanceThreads.filter((thread) => thread.isClosed).length;
    const openCount = instanceThreads.length - closedCount;
    const title = t("instance.messages.heading", {
        title: t("instance.messages.title"),
        audience: t("instance.messages.audience"),
    });
    const showThreadSummary = messageSettings.allowClose && messageSettings.layout === "threaded";
    const threadSummary = showThreadSummary
        ? openCount > 0
            ? t("instance.messages.summary_open", {count: openCount})
            : closedCount > 0
              ? t("instance.messages.summary_closed", {count: closedCount})
              : null
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
                    {messageSettings.callout && (
                        <Callout type="warning" header={t("instance.messages.callout_title")}>
                            {t("instance.messages.callout_body")}
                        </Callout>
                    )}
                    <MessageThreadPanel
                        instanceId={instance.id}
                        threads={instanceThreads}
                        canAdd={canAdd}
                        focusNewConversation={focusNewConversation}
                        onFocusNewConversationHandled={() => setFocusNewConversation(false)}
                        messageUi={{
                            layout: messageSettings.layout,
                            allowClose: messageSettings.allowClose,
                        }}
                    />
                </div>
            </Disclosure.Content>
        </Disclosure>
    );
}
