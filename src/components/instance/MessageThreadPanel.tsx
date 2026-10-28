import {useCallback, useState} from "react";

import {Button, Text, TextArea} from "@uva-fnwi/datanose-ui";

import {ConversationThread} from "./ConversationThread";
import {useTranslate} from "~/hooks/useTranslate";
import {messagesEndpoints} from "~/store/api/messagesApi";
import type {MessageThread} from "~/store/api/types/messages";

type Props = {
    instanceId: string;
    threads: MessageThread[];
    questionName?: string | null;
    canAdd: boolean;
    showClosed?: boolean;
    composerFirst?: boolean;
    /** Show the composer that starts a new conversation (e.g. instance card + control). */
    showNewComposer?: boolean;
    autoFocusComposer?: boolean;
    onDismissComposer?: () => void;
};

export function MessageThreadPanel({
    instanceId,
    threads,
    questionName = null,
    canAdd,
    showClosed: showClosedProp,
    composerFirst = false,
    showNewComposer = false,
    autoFocusComposer = false,
    onDismissComposer,
}: Props) {
    const {t} = useTranslate("workflow");
    const [body, setBody] = useState("");
    const [replyToId, setReplyToId] = useState<string | null>(null);
    const [startNewThread, setStartNewThread] = useState(false);
    const [expandedOverrides, setExpandedOverrides] = useState<Record<string, boolean>>({});
    const [addMessage, {isLoading}] = messagesEndpoints.addMessage.useMutation();

    const showClosed = showClosedProp ?? false;

    const openThreads = threads.filter((thread) => !thread.isClosed);
    const closedThreads = threads.filter((thread) => thread.isClosed);
    const visibleClosed = showClosed ? closedThreads : [];

    const isExpanded = useCallback(
        (thread: MessageThread) => {
            if (thread.id in expandedOverrides) return expandedOverrides[thread.id]!;
            return !thread.isClosed;
        },
        [expandedOverrides],
    );

    const toggleExpanded = (threadId: string, thread: MessageThread) => {
        setExpandedOverrides((prev) => ({
            ...prev,
            [threadId]: !(threadId in prev ? prev[threadId] : !thread.isClosed),
        }));
    };

    const submit = (kind: "Message" | "Close", threadId?: string) => {
        const target = threadId ?? replyToId;
        if (kind === "Message" && !body.trim()) return;
        void addMessage({
            instanceId,
            questionName: target ? undefined : questionName,
            replyToId: target,
            kind,
            body: kind === "Message" ? body.trim() : undefined,
        })
            .unwrap()
            .then(() => {
                setBody("");
                setReplyToId(null);
                setStartNewThread(false);
                if (kind === "Close" && target) {
                    setExpandedOverrides((prev) => ({...prev, [target]: false}));
                }
                if (kind === "Message" && !target) onDismissComposer?.();
            });
    };

    const startReply = (threadId: string) => {
        setReplyToId(threadId);
        setStartNewThread(false);
        setBody("");
        setExpandedOverrides((prev) => ({...prev, [threadId]: true}));
    };

    const cancelReply = () => {
        setReplyToId(null);
        setBody("");
    };

    const dismissNewThreadComposer = () => {
        setBody("");
        setStartNewThread(false);
        onDismissComposer?.();
    };

    const newThreadComposerVisible =
        canAdd &&
        replyToId == null &&
        (openThreads.length === 0 ? showNewComposer : showNewComposer || startNewThread);

    const newComposer = newThreadComposerVisible ? (
        <div className="flex flex-col gap-2">
            {openThreads.length > 0 && (
                <Text as="span" size="sm" fontWeight="semibold">
                    {t("instance.messages.new_conversation_heading")}
                </Text>
            )}
            <Composer
                body={body}
                onChange={setBody}
                onSubmit={() => submit("Message")}
                onCancel={
                    onDismissComposer != null
                        ? dismissNewThreadComposer
                        : startNewThread
                          ? () => setStartNewThread(false)
                          : undefined
                }
                submitLabel={t("save")}
                cancelLabel={onDismissComposer != null || startNewThread ? t("cancel") : undefined}
                ariaLabel={t("instance.messages.placeholder")}
                placeholder={t("instance.messages.placeholder")}
                isLoading={isLoading}
                autoFocus={autoFocusComposer}
            />
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
            ariaLabel={t("instance.messages.reply_placeholder")}
            placeholder={t("instance.messages.reply_placeholder")}
            isLoading={isLoading}
            autoFocus
        />
    );

    const threadList = (
        <div className="flex flex-col gap-3">
            {openThreads.length === 0 && closedThreads.length === 0 && (
                <Text as="span" size="sm" className="text-grey-600">
                    {t("instance.messages.empty")}
                </Text>
            )}
            {canAdd && openThreads.length > 1 && replyToId == null && !newThreadComposerVisible && (
                <Text as="span" size="sm" className="text-grey-600">
                    {t("instance.messages.reply_hint")}
                </Text>
            )}
            {canAdd &&
                openThreads.length > 0 &&
                !newThreadComposerVisible &&
                !showNewComposer &&
                !composerFirst && (
                    <Button
                        intent="secondary"
                        size="small"
                        onClick={() => {
                            setStartNewThread(true);
                            setReplyToId(null);
                            setBody("");
                        }}
                    >
                        {t("instance.messages.new")}
                    </Button>
                )}
            {openThreads.map((thread) => (
                <ConversationThread
                    key={thread.id}
                    thread={thread}
                    expanded={isExpanded(thread)}
                    onToggleExpanded={() => toggleExpanded(thread.id, thread)}
                    canAdd={canAdd}
                    isReplying={replyToId === thread.id}
                    onStartReply={() => startReply(thread.id)}
                    onCloseConversation={() => submit("Close", thread.id)}
                    isLoading={isLoading}
                    replyComposer={replyComposer}
                />
            ))}
            {visibleClosed.map((thread) => (
                <ConversationThread
                    key={thread.id}
                    thread={thread}
                    expanded={isExpanded(thread)}
                    onToggleExpanded={() => toggleExpanded(thread.id, thread)}
                    canAdd={canAdd}
                    isReplying={replyToId === thread.id}
                    onStartReply={() => startReply(thread.id)}
                    onCloseConversation={() => submit("Close", thread.id)}
                    isLoading={isLoading}
                    replyComposer={replyComposer}
                />
            ))}
        </div>
    );

    return (
        <div className="flex flex-col gap-3">
            {composerFirst ? (
                <>
                    {newComposer}
                    {threadList}
                </>
            ) : (
                <>
                    {threadList}
                    {newComposer}
                </>
            )}
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
    return (
        <div className="flex flex-col gap-2">
            <TextArea
                aria-label={ariaLabel}
                rows={3}
                value={body}
                onChange={onChange}
                autoFocus={autoFocus}
                placeholder={placeholder}
            />
            <div className="flex flex-wrap items-center gap-2">
                <Button
                    intent="primary"
                    variant="destructive"
                    size="small"
                    disabled={isLoading || !body.trim()}
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
