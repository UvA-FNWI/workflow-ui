import {useCallback, useEffect, useId, useState} from "react";

import {Button, Separator, Text, TextArea} from "@uva-fnwi/datanose-ui";

import {ConversationThread} from "./ConversationThread";
import {handleMessageSubmitShortcut} from "./messageComposerShortcuts";
import {useTranslate} from "~/hooks/useTranslate";
import {messagesEndpoints} from "~/store/api/messagesApi";
import type {MessageItemKind, MessageThread} from "~/store/api/types/messages";

type ReplyTarget = {
    threadId: string;
    parentItemId: string;
};

type Props = {
    instanceId: string;
    threads: MessageThread[];
    questionName?: string | null;
    canAdd: boolean;
    /** @deprecated Use focusNewConversation — kept for tests/mocks */
    composerFirst?: boolean;
    showNewComposer?: boolean;
    autoFocusComposer?: boolean;
    onDismissComposer?: () => void;
    focusNewConversation?: boolean;
    onFocusNewConversationHandled?: () => void;
};

export function MessageThreadPanel({
    instanceId,
    threads,
    questionName = null,
    canAdd,
    showNewComposer = false,
    autoFocusComposer = false,
    onDismissComposer,
    focusNewConversation = false,
    onFocusNewConversationHandled,
}: Props) {
    const {t} = useTranslate("workflow");
    const {t: m} = useTranslate("workflow", {keyPrefix: "instance.messages"});
    const newConversationPlaceholder = m("new_conversation_placeholder", {
        defaultValue: "Start a new conversation",
    });
    const replyPlaceholder = m("reply_placeholder", {defaultValue: "Write a reply"});
    const [body, setBody] = useState("");
    const [replyTarget, setReplyTarget] = useState<ReplyTarget | null>(null);
    const [newConversationExpanded, setNewConversationExpanded] = useState(false);
    const [expandedOverrides, setExpandedOverrides] = useState<Record<string, boolean>>({});
    const [addMessage, {isLoading}] = messagesEndpoints.addMessage.useMutation();
    const newConversationFieldId = useId();

    const openThreads = threads.filter((thread) => !thread.isClosed);
    const closedThreads = threads.filter((thread) => thread.isClosed);
    const orderedThreads = [...openThreads, ...closedThreads];

    const isExpanded = useCallback(
        (thread: MessageThread) => {
            if (thread.id in expandedOverrides) return expandedOverrides[thread.id]!;
            return !thread.isClosed;
        },
        [expandedOverrides],
    );

    const setThreadExpanded = (threadId: string, open: boolean) => {
        setExpandedOverrides((prev) => ({...prev, [threadId]: open}));
    };

    useEffect(() => {
        if (!focusNewConversation) return;
        const frame = requestAnimationFrame(() => {
            document.getElementById(newConversationFieldId)?.focus();
            onFocusNewConversationHandled?.();
        });
        return () => cancelAnimationFrame(frame);
    }, [focusNewConversation, newConversationFieldId, onFocusNewConversationHandled]);

    const submit = (kind: MessageItemKind, threadId?: string) => {
        const targetThreadId = threadId ?? replyTarget?.threadId;
        if (kind === "Message" && !body.trim()) return;

        void addMessage({
            instanceId,
            questionName: targetThreadId ? undefined : questionName,
            replyToId: targetThreadId,
            parentItemId: kind === "Message" ? replyTarget?.parentItemId : undefined,
            kind,
            body: kind === "Message" ? body.trim() : undefined,
        })
            .unwrap()
            .then(() => {
                setBody("");
                setReplyTarget(null);
                setNewConversationExpanded(false);
                if ((kind === "Close" || kind === "Reopen") && targetThreadId) {
                    setExpandedOverrides((prev) => ({
                        ...prev,
                        [targetThreadId]: kind === "Reopen",
                    }));
                }
                if (kind === "Message" && !targetThreadId) {
                    onDismissComposer?.();
                }
            });
    };

    const startReply = (threadId: string, parentItemId: string) => {
        setReplyTarget({threadId, parentItemId});
        setBody("");
        setNewConversationExpanded(false);
        setExpandedOverrides((prev) => ({...prev, [threadId]: true}));
    };

    const cancelReply = () => {
        setReplyTarget(null);
        setBody("");
    };

    const cancelNewConversation = () => {
        setBody("");
        setNewConversationExpanded(false);
        onDismissComposer?.();
    };

    const showNewConversationActions =
        newConversationExpanded ||
        body.trim().length > 0 ||
        focusNewConversation ||
        showNewComposer ||
        autoFocusComposer;
    const showNewConversationStarter = canAdd && replyTarget == null;
    const canSubmitNewMessage = !isLoading && body.trim().length > 0;

    const newConversationStarter = showNewConversationStarter ? (
        <div className="flex flex-col gap-2 pb-1">
            <TextArea
                id={newConversationFieldId}
                aria-label={newConversationPlaceholder}
                rows={showNewConversationActions ? 3 : 1}
                className={showNewConversationActions ? undefined : "min-h-10! resize-none"}
                value={body}
                onChange={setBody}
                onFocus={() => setNewConversationExpanded(true)}
                onKeyDown={(event) =>
                    handleMessageSubmitShortcut(event, () => submit("Message"), canSubmitNewMessage)
                }
                placeholder={newConversationPlaceholder}
            />
            {showNewConversationActions && (
                <div className="flex flex-wrap items-center gap-2">
                    <Button
                        intent="primary"
                        variant="destructive"
                        size="small"
                        width="none"
                        disabled={isLoading || !body.trim()}
                        onClick={() => submit("Message")}
                    >
                        {t("save")}
                    </Button>
                    <Button intent="ghost" size="small" onClick={cancelNewConversation}>
                        {t("cancel")}
                    </Button>
                </div>
            )}
        </div>
    ) : null;

    const replyComposer = (
        <Composer
            body={body}
            onChange={setBody}
            onSubmit={() => submit("Message")}
            onCancel={cancelReply}
            submitLabel={t("save")}
            cancelLabel={t("cancel")}
            ariaLabel={replyPlaceholder}
            placeholder={replyPlaceholder}
            isLoading={isLoading}
            autoFocus
        />
    );

    const renderThread = (thread: MessageThread) => (
        <ConversationThread
            key={thread.id}
            thread={thread}
            expanded={isExpanded(thread)}
            onExpandedChange={(open) => setThreadExpanded(thread.id, open)}
            canAdd={canAdd}
            replyParentItemId={
                replyTarget?.threadId === thread.id ? replyTarget.parentItemId : null
            }
            onStartReply={(parentItemId) => startReply(thread.id, parentItemId)}
            onCloseConversation={() => submit("Close", thread.id)}
            onReopenConversation={() => submit("Reopen", thread.id)}
            isLoading={isLoading}
            replyComposer={replyComposer}
        />
    );

    return (
        <div className="flex flex-col gap-3">
            {newConversationStarter}
            {openThreads.length === 0 && closedThreads.length === 0 && !canAdd && (
                <Text as="span" className="text-grey-600">
                    {m("empty")}
                </Text>
            )}
            {canAdd &&
                openThreads.length > 1 &&
                replyTarget == null &&
                !showNewConversationActions && (
                    <Text as="span" className="text-grey-600">
                        {m("reply_hint")}
                    </Text>
                )}
            <div className="flex flex-col">
                {orderedThreads.map((thread, index) => (
                    <div key={thread.id}>
                        {index > 0 && <Separator />}
                        {renderThread(thread)}
                        {index === orderedThreads.length - 1 && orderedThreads.length > 0 && (
                            <Separator />
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
}

type ComposerProps = {
    body: string;
    onChange: (value: string) => void;
    onSubmit: () => void;
    onCancel?: () => void;
    submitLabel: string;
    cancelLabel?: string;
    ariaLabel: string;
    placeholder?: string;
    isLoading: boolean;
    autoFocus?: boolean;
};

function Composer({
    body,
    onChange,
    onSubmit,
    onCancel,
    submitLabel,
    cancelLabel,
    ariaLabel,
    placeholder,
    isLoading,
    autoFocus,
}: ComposerProps) {
    const canSubmit = !isLoading && body.trim().length > 0;

    return (
        <div className="flex flex-col gap-2">
            <TextArea
                aria-label={ariaLabel}
                rows={3}
                value={body}
                onChange={onChange}
                autoFocus={autoFocus}
                placeholder={placeholder}
                onKeyDown={(event) => handleMessageSubmitShortcut(event, onSubmit, canSubmit)}
            />
            <div className="flex flex-wrap items-center gap-2">
                <Button
                    intent="primary"
                    variant="destructive"
                    size="small"
                    disabled={!canSubmit}
                    onClick={onSubmit}
                >
                    {submitLabel}
                </Button>
                {onCancel && (
                    <Button intent="ghost" size="small" onClick={onCancel}>
                        {cancelLabel}
                    </Button>
                )}
            </div>
        </div>
    );
}
