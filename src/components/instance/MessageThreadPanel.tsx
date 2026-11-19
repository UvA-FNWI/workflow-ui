import {type ReactNode, useCallback, useEffect, useId, useState} from "react";

import {Button, Callout, Separator, Text, TextArea} from "@uva-fnwi/datanose-ui";

import {ConversationThread} from "./ConversationThread";
import {FlatMessageFeed} from "./FlatMessageFeed";
import {defaultMessageUi, type MessageUiSettings} from "./instanceMessageSettings";
import {handleMessageSubmitShortcut} from "./messageComposerShortcuts";
import {getConversationOpener, newestMessageFirst} from "./messageTree";
import {useTranslate} from "~/hooks/useTranslate";
import {messagesEndpoints} from "~/store/api/messagesApi";
import type {MessageItemKind, MessageThread} from "~/store/api/types/messages";

type ReplyTarget = {
    threadId: string;
    parentItemId: string;
};

const newConversationDraftKey = "new";

type Props = {
    instanceId: string;
    threads: MessageThread[];
    questionName?: string | null;
    canAdd: boolean;
    /** @deprecated Use focusNewConversation — kept for tests/mocks */
    composerFirst?: boolean;
    /** Omit to show the compact composer. */
    showNewComposer?: boolean;
    autoFocusComposer?: boolean;
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
    autoFocusComposer = false,
    onDismissComposer,
    focusNewConversation = false,
    onFocusNewConversationHandled,
    messageUi = defaultMessageUi,
}: Props) {
    const {layout, allowClose, callout, calloutTitle, calloutText} = messageUi;
    const isFlat = layout === "flat";
    const cancelIntent = questionName == null ? "ghost" : "secondary";
    const {t, l} = useTranslate("workflow");
    const {t: m} = useTranslate("workflow", {keyPrefix: "instance.messages"});
    const newConversationPlaceholder = m("new_conversation_placeholder", {
        defaultValue: "Add a comment",
    });
    const replyPlaceholder = m("reply_placeholder", {defaultValue: "Write a reply"});
    const [body, setBody] = useState("");
    const [drafts, setDrafts] = useState<Record<string, string>>({});
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

    const draftKeyFor = (target: ReplyTarget | null) =>
        target?.parentItemId ?? newConversationDraftKey;

    const storeDraft = (key: string, text: string) => {
        setDrafts((current) => {
            const next = {...current};
            if (text.trim()) next[key] = text;
            else delete next[key];
            return next;
        });
    };

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
                if (kind === "Message") storeDraft(draftKeyFor(replyTarget), "");
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
                    onDismissComposer?.("saved");
                }
            });
    };

    const startReply = (threadId: string, parentItemId: string) => {
        storeDraft(draftKeyFor(replyTarget), body);
        setReplyTarget({threadId, parentItemId});
        setBody(drafts[parentItemId] ?? "");
        setNewConversationExpanded(false);
        setExpandedOverrides((prev) => ({...prev, [threadId]: true}));
    };

    const cancelReply = () => {
        if (replyTarget) storeDraft(replyTarget.parentItemId, "");
        setReplyTarget(null);
        setBody(drafts[newConversationDraftKey] ?? "");
    };

    const cancelNewConversation = () => {
        storeDraft(newConversationDraftKey, "");
        setBody("");
        setNewConversationExpanded(false);
        onDismissComposer?.("cancel");
    };

    const composingNewConversation = replyTarget == null;
    const newComposerVisible = canAdd && showNewComposer !== false;
    const showNewConversationActions =
        composingNewConversation &&
        (newConversationExpanded ||
            drafts[newConversationDraftKey]?.trim().length > 0 ||
            body.trim().length > 0 ||
            focusNewConversation ||
            showNewComposer ||
            autoFocusComposer);
    const newConversationBody = composingNewConversation
        ? body
        : (drafts[newConversationDraftKey] ?? "");
    const canSubmitNewMessage =
        !isLoading && composingNewConversation && newConversationBody.trim().length > 0;
    const messageCallout = callout && (
        <Callout type="warning" header={l(calloutTitle) ?? m("callout_title")}>
            {l(calloutText) ?? m("callout_body")}
        </Callout>
    );

    const newConversationStarter = newComposerVisible ? (
        <div className="flex flex-col gap-2">
            <TextArea
                id={newConversationFieldId}
                aria-label={newConversationPlaceholder}
                rows={showNewConversationActions ? 3 : 1}
                className={showNewConversationActions ? "w-full" : "min-h-10! w-full resize-none"}
                value={newConversationBody}
                onChange={composingNewConversation ? setBody : undefined}
                readOnly={!composingNewConversation}
                onFocus={() => {
                    if (replyTarget) {
                        if (!focusNewConversation) return;
                        storeDraft(draftKeyFor(replyTarget), body);
                        setReplyTarget(null);
                        setBody(newConversationBody);
                    }
                    setNewConversationExpanded(true);
                }}
                onKeyDown={(event) =>
                    composingNewConversation &&
                    handleMessageSubmitShortcut(event, () => submit("Message"), canSubmitNewMessage)
                }
                placeholder={newConversationPlaceholder}
            />
            {composingNewConversation && messageCallout}
            {showNewConversationActions && (
                <div className="flex flex-wrap items-center gap-2">
                    <Button
                        intent="primary"
                        variant="destructive"
                        width="none"
                        disabled={!canSubmitNewMessage}
                        onClick={() => submit("Message")}
                    >
                        {t("save")}
                    </Button>
                    <Button intent={cancelIntent} onClick={cancelNewConversation}>
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
            cancelIntent={cancelIntent}
            submitLabel={t("save")}
            cancelLabel={t("cancel")}
            ariaLabel={replyPlaceholder}
            placeholder={replyPlaceholder}
            callout={messageCallout}
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
            canAdd={canAdd && !isFlat}
            allowClose={allowClose}
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
                    {m("empty")}
                </Text>
            )}
            {threadList}
        </div>
    );
}

type ComposerProps = {
    body: string;
    onChange: (value: string) => void;
    onSubmit: () => void;
    onCancel?: () => void;
    cancelIntent: "ghost" | "secondary";
    submitLabel: string;
    cancelLabel?: string;
    ariaLabel: string;
    placeholder?: string;
    callout?: ReactNode;
    isLoading: boolean;
    autoFocus?: boolean;
};

function Composer({
    body,
    onChange,
    onSubmit,
    onCancel,
    cancelIntent,
    submitLabel,
    cancelLabel,
    ariaLabel,
    placeholder,
    callout,
    isLoading,
    autoFocus,
}: ComposerProps) {
    const canSubmit = !isLoading && body.trim().length > 0;

    return (
        <div className="flex w-full flex-col gap-2">
            <TextArea
                aria-label={ariaLabel}
                className="w-full"
                rows={3}
                value={body}
                onChange={onChange}
                autoFocus={autoFocus}
                placeholder={placeholder}
                onKeyDown={(event) => handleMessageSubmitShortcut(event, onSubmit, canSubmit)}
            />
            {callout}
            <div className="flex flex-wrap items-center gap-2">
                <Button
                    intent="primary"
                    variant="destructive"
                    disabled={!canSubmit}
                    onClick={onSubmit}
                >
                    {submitLabel}
                </Button>
                {onCancel && (
                    <Button intent={cancelIntent} onClick={onCancel}>
                        {cancelLabel}
                    </Button>
                )}
            </div>
        </div>
    );
}
