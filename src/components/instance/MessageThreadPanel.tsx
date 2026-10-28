import {useState} from "react";

import {Button, Callout, Separator, Text, TextArea} from "@uva-fnwi/datanose-ui";

import {useTranslate} from "~/hooks/useTranslate";
import {messagesEndpoints} from "~/store/api/messagesApi";
import type {MessageThread} from "~/store/api/types/messages";
import {formatDate} from "~/utils/formatDate";

type Props = {
    instanceId: string;
    threads: MessageThread[];
    questionName?: string | null;
    canAdd: boolean;
    showClosed?: boolean;
    onShowClosedChange?: (show: boolean) => void;
    composerFirst?: boolean;
    showNewComposer?: boolean;
    showMailCallout?: boolean;
    autoFocusComposer?: boolean;
    onDismissComposer?: () => void;
};

export function MessageThreadPanel({
    instanceId,
    threads,
    questionName = null,
    canAdd,
    showClosed: showClosedProp,
    onShowClosedChange,
    composerFirst = false,
    showNewComposer,
    showMailCallout = false,
    autoFocusComposer = false,
    onDismissComposer,
}: Props) {
    const {t, i18n} = useTranslate("workflow");
    const [body, setBody] = useState("");
    const [replyToId, setReplyToId] = useState<string | null>(null);
    const [internalShowClosed, setInternalShowClosed] = useState(false);
    const [addMessage, {isLoading}] = messagesEndpoints.addMessage.useMutation();

    const showClosed = onShowClosedChange ? (showClosedProp ?? false) : internalShowClosed;
    const setShowClosed = onShowClosedChange ?? setInternalShowClosed;

    const openThreads = threads.filter((thread) => !thread.isClosed);
    const closedThreads = threads.filter((thread) => thread.isClosed);
    const visibleThreads = showClosed ? [...openThreads, ...closedThreads] : openThreads;

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
                if (kind === "Message" && !target) onDismissComposer?.();
            });
    };

    const startReply = (threadId: string) => {
        setReplyToId(threadId);
        setBody("");
    };

    const cancelReply = () => {
        setReplyToId(null);
        setBody("");
    };

    const newComposer =
        canAdd && replyToId == null && (showNewComposer ?? true) ? (
            <Composer
                body={body}
                onChange={setBody}
                onSubmit={() => submit("Message")}
                onCancel={onDismissComposer}
                submitLabel={t("save")}
                cancelLabel={onDismissComposer ? t("cancel") : undefined}
                ariaLabel={t("instance.messages.placeholder")}
                placeholder={t("instance.messages.placeholder")}
                isLoading={isLoading}
                showMailCallout={showMailCallout}
                autoFocus={autoFocusComposer}
            />
        ) : null;

    const threadList = (
        <>
            {openThreads.length === 0 && closedThreads.length === 0 && (
                <Text as="span" size="sm" className="text-grey-600">
                    {t("instance.messages.empty")}
                </Text>
            )}
            {visibleThreads.map((thread, index) => (
                <div key={thread.id} className="flex flex-col gap-2">
                    {index > 0 && <Separator />}
                    {thread.items.map((item, itemIndex) => (
                        <div key={`${thread.id}-${itemIndex}`} className="flex flex-col gap-1">
                            {item.body && (
                                <Text as="span" size="sm">
                                    {item.body}
                                </Text>
                            )}
                            <div className="flex flex-wrap items-baseline gap-x-2">
                                <Text as="span" size="sm" fontWeight="semibold">
                                    {item.user.displayName}
                                </Text>
                                <Text as="span" size="sm" className="text-grey-600">
                                    {formatDate(item.dateTime, i18n.language)}
                                    {item.kind === "Close"
                                        ? ` · ${t("instance.messages.closed")}`
                                        : ""}
                                </Text>
                            </div>
                        </div>
                    ))}
                    {canAdd && !thread.isClosed && replyToId !== thread.id && (
                        <div className="flex flex-wrap items-center gap-2">
                            <Button
                                intent="primary"
                                variant="destructive"
                                size="small"
                                onClick={() => startReply(thread.id)}
                            >
                                {t("instance.messages.reply")}
                            </Button>
                            <Button
                                intent="secondary"
                                size="small"
                                disabled={isLoading}
                                onClick={() => submit("Close", thread.id)}
                            >
                                {t("instance.messages.close")}
                            </Button>
                        </div>
                    )}
                    {canAdd && !thread.isClosed && replyToId === thread.id && (
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
                    )}
                </div>
            ))}
            {closedThreads.length > 0 && onShowClosedChange == null && (
                <Button intent="secondary" size="small" onClick={() => setShowClosed(!showClosed)}>
                    {showClosed
                        ? t("instance.messages.hide_closed")
                        : t("instance.messages.show_closed", {count: closedThreads.length})}
                </Button>
            )}
        </>
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
    showMailCallout?: boolean;
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
    showMailCallout,
}: ComposerProps) {
    const {t} = useTranslate("workflow");
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
            {showMailCallout && (
                <Callout type="info">{t("instance.messages.mail_callout")}</Callout>
            )}
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
