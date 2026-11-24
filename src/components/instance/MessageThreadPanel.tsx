import {type ReactNode, useCallback, useEffect, useId, useState} from "react";

import {Button, Callout, type CalloutType, Separator, Text, TextArea} from "@uva-fnwi/datanose-ui";

import {ConversationThread} from "./ConversationThread";
import {FlatMessageFeed} from "./FlatMessageFeed";
import {defaultMessageUi, type MessageUiSettings, useMessageTerms} from "./instanceMessageSettings";
import {handleMessageSubmitShortcut} from "./messageComposerShortcuts";
import {getConversationOpener, newestMessageFirst} from "./messageTree";
import {useTranslate} from "~/hooks/useTranslate";
import {messagesEndpoints} from "~/store/api/messagesApi";
import type {MessageThread} from "~/store/api/types/messages";

type ReplyTarget = {
    threadId: string;
    parentItemId: string;
};

type Draft = {
    text: string;
    error?: string;
};

const newConversationDraftKey = "new";
const draftKey = (target: ReplyTarget | null) =>
    target ? `${target.threadId}:${target.parentItemId}` : newConversationDraftKey;

type Props = {
    instanceId: string;
    threads: MessageThread[];
    questionName?: string | null;
    canAdd: boolean;
    /** Omit to show the compact composer. */
    showNewComposer?: boolean;
    onDismissComposer?: (reason: "cancel" | "saved") => void;
    focusNewConversation?: boolean;
    onFocusNewConversationHandled?: () => void;
    messageUi?: MessageUiSettings;
};

export function MessageThreadPanel({
    instanceId,
    threads,
    questionName = null,
    canAdd,
    showNewComposer,
    onDismissComposer,
    focusNewConversation = false,
    onFocusNewConversationHandled,
    messageUi = defaultMessageUi,
}: Props) {
    const {layout, allowClose, callout} = messageUi;
    const isFlat = layout === "flat";
    const cancelIntent: ComposerProps["cancelIntent"] =
        questionName == null ? "ghost" : "secondary";
    const {t, l} = useTranslate("workflow");
    const {t: m} = useTranslate("workflow", {keyPrefix: "instance.messages"});
    const terms = useMessageTerms(messageUi);
    const newConversationPlaceholder = m("new_conversation_placeholder", terms);
    const replyPlaceholder = m("reply_placeholder", terms);
    const [drafts, setDrafts] = useState<Record<string, Draft>>({});
    const [replyTarget, setReplyTarget] = useState<ReplyTarget | null>(null);
    const [newConversationExpanded, setNewConversationExpanded] = useState(false);
    const [expandedOverrides, setExpandedOverrides] = useState<Record<string, boolean>>({});
    const [addMessage, {isLoading}] = messagesEndpoints.addMessage.useMutation();
    const newConversationFieldId = useId();

    const isExpanded = useCallback(
        (thread: MessageThread) => {
            if (thread.id in expandedOverrides) return expandedOverrides[thread.id]!;
            return !allowClose || !thread.isClosed;
        },
        [allowClose, expandedOverrides],
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

    const setDraft = (key: string, draft: Draft) => {
        setDrafts((current) => {
            const next = {...current};
            if (draft.text) next[key] = draft;
            else delete next[key];
            return next;
        });
    };

    const saveDraft = async (target: ReplyTarget | null) => {
        const key = draftKey(target);
        const text = drafts[key]?.text ?? "";
        if (isLoading || !text.trim()) return;

        const result = await addMessage({
            instanceId,
            questionName: target ? undefined : questionName,
            replyToId: target?.threadId,
            parentItemId: target?.parentItemId,
            kind: "Message",
            body: text.trim(),
        });
        if ("error" in result) {
            setDraft(key, {text, error: t("instance.summary.save_error")});
            return;
        }

        setDraft(key, {text: ""});
        if (target) {
            setReplyTarget((current) => (draftKey(current) === key ? null : current));
        } else {
            setNewConversationExpanded(false);
            onDismissComposer?.("saved");
        }
    };

    const changeThreadStatus = async (threadId: string, kind: "Close" | "Reopen") => {
        if (isLoading) return;

        const result = await addMessage({instanceId, replyToId: threadId, kind});
        if ("error" in result) return;

        setThreadExpanded(threadId, kind === "Reopen");
        if (kind === "Close") {
            setReplyTarget((current) => (current?.threadId === threadId ? null : current));
        }
    };

    const draftProps = (target: ReplyTarget | null) => {
        const key = draftKey(target);
        const draft = drafts[key];
        return {
            body: draft?.text ?? "",
            error: draft?.error,
            onChange: (text: string) => setDraft(key, {text}),
            onSubmit: () => void saveDraft(target),
            isLoading,
            cancelIntent,
            submitLabel: t("save"),
            cancelLabel: t("cancel"),
        };
    };

    const startReply = (threadId: string, parentItemId: string) => {
        setReplyTarget({threadId, parentItemId});
        setNewConversationExpanded(false);
        setThreadExpanded(threadId, true);
    };

    const cancelReply = () => {
        if (replyTarget) setDraft(draftKey(replyTarget), {text: ""});
        setReplyTarget(null);
    };

    const cancelNewConversation = () => {
        setDraft(newConversationDraftKey, {text: ""});
        setNewConversationExpanded(false);
        onDismissComposer?.("cancel");
    };

    const composingNewConversation = replyTarget == null;
    const newComposerVisible =
        canAdd && showNewComposer !== false && (questionName == null || composingNewConversation);
    const showNewConversationActions =
        composingNewConversation &&
        (newConversationExpanded ||
            Boolean(drafts[newConversationDraftKey]?.text.trim()) ||
            focusNewConversation ||
            showNewComposer === true);
    const calloutTitle = l(callout?.title)?.trim();
    const calloutText = l(callout?.text)?.trim();
    const messageCallout =
        callout && (calloutTitle || calloutText) ? (
            <Callout type={callout.variant.toLowerCase() as CalloutType} header={calloutTitle}>
                {calloutText}
            </Callout>
        ) : null;

    const newConversationStarter = newComposerVisible ? (
        <Composer
            {...draftProps(null)}
            id={newConversationFieldId}
            placeholder={newConversationPlaceholder}
            expanded={showNewConversationActions}
            readOnly={!composingNewConversation}
            callout={composingNewConversation && messageCallout}
            onCancel={cancelNewConversation}
            onFocus={() => {
                if (replyTarget) {
                    if (!focusNewConversation) return;
                    setReplyTarget(null);
                }
                setNewConversationExpanded(true);
            }}
        />
    ) : null;

    const replyComposer = replyTarget ? (
        <Composer
            {...draftProps(replyTarget)}
            onCancel={cancelReply}
            placeholder={replyPlaceholder}
            callout={messageCallout}
            autoFocus
        />
    ) : null;

    const renderThread = (thread: MessageThread) => (
        <ConversationThread
            key={thread.id}
            thread={thread}
            expanded={isExpanded(thread)}
            onExpandedChange={(open) => setThreadExpanded(thread.id, open)}
            canAdd={canAdd && !isFlat}
            allowClose={allowClose}
            replyParentItemId={
                replyTarget?.threadId === thread.id ? replyTarget.parentItemId : null
            }
            onStartReply={(parentItemId) => startReply(thread.id, parentItemId)}
            onCloseConversation={() => void changeThreadStatus(thread.id, "Close")}
            onReopenConversation={() => void changeThreadStatus(thread.id, "Reopen")}
            isLoading={isLoading}
            replyComposer={replyComposer}
        />
    );

    const orderedThreads = isFlat
        ? []
        : threads
              .flatMap((thread) => {
                  const opener = getConversationOpener(thread.items);
                  return opener ? [{thread, opener}] : [];
              })
              .sort((a, b) => {
                  if (a.thread.isClosed !== b.thread.isClosed) return a.thread.isClosed ? 1 : -1;
                  return newestMessageFirst(a.opener, b.opener);
              });

    const threadList = isFlat ? (
        <FlatMessageFeed threads={threads} />
    ) : (
        <div className="flex flex-col">
            {orderedThreads.map(({thread}, index) => (
                <div key={thread.id}>
                    {index > 0 && <Separator />}
                    {renderThread(thread)}
                    {index === orderedThreads.length - 1 && orderedThreads.length > 0 && (
                        <Separator />
                    )}
                </div>
            ))}
        </div>
    );

    return (
        <div className="flex flex-col gap-3">
            {newConversationStarter}
            {threads.length === 0 && !newComposerVisible && (
                <Text as="span" className="text-grey-600">
                    {m("empty", terms)}
                </Text>
            )}
            {threadList}
        </div>
    );
}

type ComposerProps = {
    id?: string;
    body: string;
    error?: string;
    onChange: (value: string) => void;
    onSubmit: () => void;
    onCancel: () => void;
    onFocus?: () => void;
    cancelIntent: "ghost" | "secondary";
    submitLabel: string;
    cancelLabel: string;
    placeholder: string;
    callout?: ReactNode;
    expanded?: boolean;
    readOnly?: boolean;
    isLoading: boolean;
    autoFocus?: boolean;
};

function Composer({
    id,
    body,
    error,
    onChange,
    onSubmit,
    onCancel,
    onFocus,
    cancelIntent,
    submitLabel,
    cancelLabel,
    placeholder,
    callout,
    expanded = true,
    readOnly = false,
    isLoading,
    autoFocus,
}: ComposerProps) {
    const isReadOnly = isLoading || readOnly;
    const canSubmit = expanded && !isReadOnly && body.trim().length > 0;

    return (
        <div className="flex w-full flex-col gap-2">
            <TextArea
                id={id}
                aria-label={placeholder}
                className={expanded ? "w-full" : "min-h-10! w-full resize-none"}
                rows={expanded ? 3 : 1}
                value={body}
                onChange={isReadOnly ? undefined : onChange}
                onFocus={onFocus}
                readOnly={isReadOnly}
                autoFocus={autoFocus}
                placeholder={placeholder}
                onKeyDown={(event) => handleMessageSubmitShortcut(event, onSubmit, canSubmit)}
            />
            {error && (
                <Text role="alert" intent="error" size="sm">
                    {error}
                </Text>
            )}
            {callout}
            {expanded && (
                <div className="flex flex-wrap items-center gap-2">
                    <Button
                        intent="primary"
                        variant="destructive"
                        width="none"
                        disabled={!canSubmit}
                        onClick={onSubmit}
                    >
                        {submitLabel}
                    </Button>
                    <Button intent={cancelIntent} disabled={isLoading} onClick={onCancel}>
                        {cancelLabel}
                    </Button>
                </div>
            )}
        </div>
    );
}
