import {useState} from "react";

import {Button, Disclosure, Heading, Icon, Pill} from "@uva-fnwi/datanose-ui";

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
    const [showNewComposer, setShowNewComposer] = useState(false);
    const [focusNewConversation, setFocusNewConversation] = useState(false);

    if (!messageSettings?.card || !canView) return null;

    const instanceThreads = threads.filter((thread) => thread.questionName == null);
    const canAdd = instance.permissions.includes("AddMessages");
    const composerVisible = canAdd && showNewComposer;
    if (!canAdd && !messagesLoaded) return null;
    if (!shouldShowMessageUi(canAdd, instanceThreads.length)) return null;

    const count = instanceThreads.length;
    const showOpenCloseSummary =
        messageSettings.allowClose && messageSettings.layout === "threaded";
    const openCount = showOpenCloseSummary
        ? instanceThreads.filter((thread) => !thread.isClosed).length
        : 0;
    const title = t("instance.messages.heading", {
        title:
            !showOpenCloseSummary && count > 0
                ? t("instance.messages.title_count", {count})
                : t("instance.messages.title"),
        audience: t("instance.messages.audience"),
    });

    return (
        <Disclosure
            isExpanded={expanded}
            onExpandedChange={(open) => {
                setExpanded(open);
                if (!open) {
                    setShowNewComposer(false);
                    setFocusNewConversation(false);
                }
            }}
        >
            <div className="flex flex-row items-center justify-between">
                <Disclosure.Header>
                    <div className="flex min-w-0 flex-wrap items-center gap-2">
                        <Heading className="font-semibold">{title}</Heading>
                        {showOpenCloseSummary && count > 0 && (
                            <Pill variant={openCount > 0 ? "red" : "grey"}>
                                {openCount > 0
                                    ? t("instance.messages.summary_open", {count: openCount})
                                    : t("instance.messages.summary_closed", {count})}
                            </Pill>
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
                            aria-label={t("instance.messages.add")}
                            aria-expanded={composerVisible}
                            onClick={() => {
                                setExpanded(true);
                                setShowNewComposer(true);
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
                        showNewComposer={composerVisible}
                        onDismissComposer={() => setShowNewComposer(false)}
                        focusNewConversation={focusNewConversation}
                        onFocusNewConversationHandled={() => setFocusNewConversation(false)}
                        messageUi={messageSettings}
                    />
                </div>
            </Disclosure.Content>
        </Disclosure>
    );
}
