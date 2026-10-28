import {useState} from "react";

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

    const collapsedClosedSummary = thread.isClosed && !expanded;
    const collapsedOpenPreview = !thread.isClosed && !expanded && root.body;

    return (
        <article
            className={
                thread.isClosed
                    ? "flex flex-col gap-2 rounded-md border border-grey-200 px-3 py-2 dark:border-grey-700"
                    : "flex flex-col gap-2 rounded-md border border-grey-200 p-3 dark:border-grey-700"
            }
        >
            <button
                type="button"
                className="flex w-full min-w-0 items-start gap-2 text-left"
                aria-expanded={expanded}
                aria-label={headerLabel}
                onClick={onToggleExpanded}
            >
                <Icon
                    name="bubble-message-line"
                    size="sm"
                    className="mt-0.5 shrink-0"
                    color={thread.isClosed ? "secondary" : "current"}
                    decorative
                />
                <div className="min-w-0 flex-1">
                    {collapsedClosedSummary ? (
                        <Text as="span" size="sm" className="block truncate text-grey-800">
                            {root.user.displayName}
                            {" · "}
                            {formatDate(root.dateTime, i18n.language)}
                            {" · "}
                            {t("instance.messages.closed")}
                        </Text>
                    ) : (
                        <>
                            <div className="flex min-w-0 flex-wrap items-baseline gap-x-2">
                                <Text as="span" size="sm" fontWeight="semibold">
                                    {root.user.displayName}
                                </Text>
                                <Text as="span" size="sm" className="text-grey-600">
                                    {formatDate(root.dateTime, i18n.language)}
                                </Text>
                                {thread.isClosed && expanded && (
                                    <Text as="span" size="sm" className="text-grey-600">
                                        · {t("instance.messages.closed")}
                                    </Text>
                                )}
                            </div>
                            {collapsedOpenPreview && (
                                <Text as="span" size="sm" className="line-clamp-2 text-grey-800">
                                    {previewText(root.body)}
                                </Text>
                            )}
                        </>
                    )}
                </div>
                <Icon
                    name={expanded ? "chevron-down-line" : "chevron-right-line"}
                    size="sm"
                    className="mt-0.5 shrink-0 text-grey-600"
                    decorative
                />
            </button>

            {expanded && (
                <>
                    <div className="ml-7 flex flex-col gap-1">
                        {root.body && (
                            <Text as="span" size="sm">
                                {root.body}
                            </Text>
                        )}
                    </div>

                    {replies.length > 0 && (
                        <div
                            className="ml-7 flex flex-col border-l-2 border-grey-200 dark:border-grey-700"
                            role="list"
                        >
                            {replies.map((item, index) => (
                                <ReplyItem
                                    key={`${thread.id}-reply-${index}`}
                                    item={item}
                                    isLast={index === replies.length - 1}
                                />
                            ))}
                        </div>
                    )}

                    {canAdd && !thread.isClosed && isReplying && (
                        <div className="ml-7 pl-3">{replyComposer}</div>
                    )}

                    {canAdd && !thread.isClosed && (
                        <div className="ml-7 flex flex-wrap items-center gap-2 pl-3">
                            {!isReplying && (
                                <Button
                                    intent="primary"
                                    variant="destructive"
                                    size="small"
                                    onClick={(event) => {
                                        event.stopPropagation();
                                        onStartReply();
                                    }}
                                >
                                    {t("instance.messages.reply")}
                                </Button>
                            )}
                            <Button
                                intent="secondary"
                                size="small"
                                disabled={isLoading}
                                onClick={(event) => {
                                    event.stopPropagation();
                                    onCloseConversation();
                                }}
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

function ReplyItem({item, isLast}: {item: MessageItem; isLast: boolean}) {
    const {t, i18n} = useTranslate("workflow");
    const [open, setOpen] = useState(true);

    const toggleLabel = open
        ? t("instance.messages.collapse_reply")
        : t("instance.messages.expand_reply");

    return (
        <div
            role="listitem"
            className={`group hover:bg-grey-50 relative pr-1 pl-3 transition-colors dark:hover:bg-grey-800/40 ${
                isLast ? "pb-0" : "pb-1"
            }`}
        >
            <div
                className="pointer-events-none absolute top-0 bottom-0 left-0 w-0.5 bg-grey-200 transition-colors group-hover:bg-grey-400 dark:bg-grey-600 dark:group-hover:bg-grey-400"
                aria-hidden
            />
            <button
                type="button"
                className="flex w-full min-w-0 items-start gap-1.5 py-1 text-left"
                aria-expanded={open}
                aria-label={toggleLabel}
                onClick={() => setOpen((value) => !value)}
            >
                <Icon
                    name={open ? "chevron-down-line" : "chevron-right-line"}
                    size="xs"
                    className="mt-1 shrink-0 text-grey-600"
                    decorative
                />
                <div className="min-w-0 flex-1">
                    <div className="flex min-w-0 flex-wrap items-baseline gap-x-2">
                        <Text as="span" size="sm" fontWeight="semibold">
                            {item.user.displayName}
                        </Text>
                        <Text as="span" size="sm" className="text-grey-600">
                            {formatDate(item.dateTime, i18n.language)}
                        </Text>
                    </div>
                    {open && item.body && (
                        <Text as="span" size="sm" className="mt-1 block">
                            {item.body}
                        </Text>
                    )}
                    {!open && item.body && (
                        <Text as="span" size="sm" className="mt-0.5 block truncate text-grey-700">
                            {previewText(item.body, 80)}
                        </Text>
                    )}
                </div>
            </button>
        </div>
    );
}
