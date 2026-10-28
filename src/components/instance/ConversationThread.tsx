import {Button, Icon, Text} from "@uva-fnwi/datanose-ui";

import {useTranslate} from "~/hooks/useTranslate";
import type {MessageItem, MessageThread} from "~/store/api/types/messages";
import {formatDate} from "~/utils/formatDate";

type Props = {
    thread: MessageThread;
    expanded: boolean;
    onToggleExpanded: () => void;
    canAdd: boolean;
    isReplying: boolean;
    onStartReply: () => void;
    onCloseConversation: () => void;
    isLoading: boolean;
    replyComposer: React.ReactNode;
};

function messageItems(thread: MessageThread): MessageItem[] {
    return thread.items.filter((item) => item.kind === "Message");
}

function previewText(body: string | undefined, max = 120) {
    if (!body?.trim()) return "";
    const trimmed = body.trim().replace(/\s+/g, " ");
    if (trimmed.length <= max) return trimmed;
    return `${trimmed.slice(0, max - 1)}…`;
}

export function ConversationThread({
    thread,
    expanded,
    onToggleExpanded,
    canAdd,
    isReplying,
    onStartReply,
    onCloseConversation,
    isLoading,
    replyComposer,
}: Props) {
    const {t, i18n} = useTranslate("workflow");
    const items = messageItems(thread);
    const root = items[0];
    const replies = items.slice(1);

    if (!root) return null;

    const headerLabel = expanded
        ? t("instance.messages.collapse_conversation")
        : t("instance.messages.expand_conversation");

    return (
        <article className="flex flex-col gap-2 rounded-md border border-grey-200 p-3 dark:border-grey-700">
            <button
                type="button"
                className="flex w-full items-start gap-2 text-left"
                aria-expanded={expanded}
                aria-label={headerLabel}
                onClick={onToggleExpanded}
            >
                <Icon
                    name={expanded ? "chevron-down-line" : "chevron-right-line"}
                    size="sm"
                    className="mt-0.5 shrink-0"
                    decorative
                />
                <div className="flex min-w-0 flex-1 flex-col gap-1">
                    <div className="flex flex-wrap items-baseline gap-x-2">
                        <Text as="span" size="sm" fontWeight="semibold">
                            {root.user.displayName}
                        </Text>
                        <Text as="span" size="sm" className="text-grey-600">
                            {formatDate(root.dateTime, i18n.language)}
                        </Text>
                        {thread.isClosed && (
                            <Text as="span" size="sm" className="text-grey-600">
                                · {t("instance.messages.closed")}
                            </Text>
                        )}
                    </div>
                    {!expanded && root.body && (
                        <Text as="span" size="sm" className="line-clamp-2 text-grey-800">
                            {previewText(root.body)}
                        </Text>
                    )}
                </div>
            </button>

            {expanded && (
                <>
                    <div className="ml-5 flex flex-col gap-1 pl-1">
                        {root.body && (
                            <Text as="span" size="sm">
                                {root.body}
                            </Text>
                        )}
                    </div>

                    {replies.length > 0 && (
                        <div className="ml-5 flex flex-col gap-3 border-l-2 border-grey-200 pl-3 dark:border-grey-700">
                            {replies.map((item, index) => (
                                <MessageItemView key={`${thread.id}-reply-${index}`} item={item} />
                            ))}
                        </div>
                    )}

                    {canAdd && !thread.isClosed && isReplying && (
                        <div className="ml-5 pl-3">{replyComposer}</div>
                    )}

                    {canAdd && !thread.isClosed && (
                        <div className="ml-5 flex flex-wrap items-center gap-2 pl-3">
                            {!isReplying && (
                                <Button
                                    intent="primary"
                                    variant="destructive"
                                    size="small"
                                    onClick={onStartReply}
                                >
                                    {t("instance.messages.reply")}
                                </Button>
                            )}
                            <Button
                                intent="secondary"
                                size="small"
                                disabled={isLoading}
                                onClick={onCloseConversation}
                            >
                                {t("instance.messages.close_conversation")}
                            </Button>
                        </div>
                    )}
                </>
            )}
        </article>
    );
}

function MessageItemView({item}: {item: MessageItem}) {
    const {i18n} = useTranslate("workflow");

    return (
        <div className="flex flex-col gap-1">
            <div className="flex flex-wrap items-baseline gap-x-2">
                <Text as="span" size="sm" fontWeight="semibold">
                    {item.user.displayName}
                </Text>
                <Text as="span" size="sm" className="text-grey-600">
                    {formatDate(item.dateTime, i18n.language)}
                </Text>
            </div>
            {item.body && (
                <Text as="span" size="sm">
                    {item.body}
                </Text>
            )}
        </div>
    );
}
