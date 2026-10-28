import {Button, Icon, Text} from "@uva-fnwi/datanose-ui";

import {buildReplyTree, type MessageTreeNode} from "./messageTree";
import {useTranslate} from "~/hooks/useTranslate";
import type {MessageItem, MessageThread} from "~/store/api/types/messages";
import {formatDate} from "~/utils/formatDate";

/** Cap reply indent so deep API trees do not become a ladder of rails. */
const MAX_REPLY_VISUAL_DEPTH = 2;

type Props = {
    thread: MessageThread;
    expanded: boolean;
    onExpandedChange: (open: boolean) => void;
    canAdd: boolean;
    replyParentItemId: string | null;
    onStartReply: (parentItemId: string) => void;
    onCloseConversation: () => void;
    onReopenConversation: () => void;
    isLoading: boolean;
    replyComposer: React.ReactNode;
};

function messageItems(thread: MessageThread): MessageItem[] {
    return thread.items.filter((item) => item.kind === "Message");
}

function ReplyButton({label, onClick}: {label: string; onClick: () => void}) {
    return (
        <Button
            intent="primary"
            variant="destructive"
            size="small"
            className="w-fit"
            leftIcon={<Icon name="bubble-message-line" size="xs" color="current" decorative />}
            onClick={onClick}
        >
            {label}
        </Button>
    );
}

function MessageMeta({
    displayName,
    dateTime,
    language,
    suffix,
    showDate = true,
    dateOnHover = false,
}: {
    displayName: string;
    dateTime: string;
    language: string;
    suffix?: string;
    showDate?: boolean;
    dateOnHover?: boolean;
}) {
    const formattedDate = formatDate(dateTime, language);

    return (
        <div className="flex min-w-0 flex-wrap items-baseline gap-x-2">
            <Text as="span" fontWeight="semibold" className="text-grey-900 dark:text-white">
                {displayName}
            </Text>
            {showDate && (
                <time
                    dateTime={dateTime}
                    title={formattedDate}
                    className={
                        dateOnHover
                            ? "text-grey-600 max-md:inline md:opacity-0 md:transition-opacity md:group-hover/reply:opacity-100"
                            : "text-grey-600"
                    }
                >
                    {formattedDate}
                </time>
            )}
            {suffix && (
                <Text as="span" className="text-grey-600">
                    · {suffix}
                </Text>
            )}
        </div>
    );
}

function MessageBody({body, className}: {body: string; className?: string}) {
    return (
        <Text
            as="p"
            className={`whitespace-pre-wrap text-grey-900 dark:text-white ${className ?? "mt-2"}`}
        >
            {body}
        </Text>
    );
}

function CollapsedConversationSummary({
    root,
    isClosed,
    language,
    closedLabel,
}: {
    root: MessageItem;
    isClosed: boolean;
    language: string;
    closedLabel: string;
}) {
    return (
        <Text as="span" className="block truncate text-grey-800 dark:text-grey-100">
            {root.user.displayName}
            {" · "}
            {formatDate(root.dateTime, language)}
            {isClosed && (
                <>
                    {" · "}
                    {closedLabel}
                </>
            )}
        </Text>
    );
}

export function ConversationThread({
    thread,
    expanded,
    onExpandedChange,
    canAdd,
    replyParentItemId,
    onStartReply,
    onCloseConversation,
    onReopenConversation,
    isLoading,
    replyComposer,
}: Props) {
    const {t, i18n} = useTranslate("workflow");
    const items = messageItems(thread);
    const root = items[0];

    if (!root) return null;

    const replyTree = buildReplyTree(thread.items);
    const toggleLabel = expanded
        ? t("instance.messages.collapse_conversation")
        : t("instance.messages.expand_conversation");
    const closedLabel = t("instance.messages.closed");

    const toggle = () => onExpandedChange(!expanded);

    return (
        <article className={thread.isClosed ? "opacity-60" : undefined}>
            <button
                type="button"
                className="flex w-full min-w-0 items-start justify-between gap-4 py-4 text-left transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
                aria-expanded={expanded}
                aria-label={toggleLabel}
                onClick={toggle}
            >
                <div className="min-w-0 flex-1">
                    {!expanded ? (
                        <CollapsedConversationSummary
                            root={root}
                            isClosed={thread.isClosed}
                            language={i18n.language}
                            closedLabel={closedLabel}
                        />
                    ) : (
                        <MessageMeta
                            displayName={root.user.displayName}
                            dateTime={root.dateTime}
                            language={i18n.language}
                            suffix={thread.isClosed ? closedLabel : undefined}
                        />
                    )}
                </div>
                <Icon
                    name={expanded ? "minus-small-line" : "plus-small-line"}
                    size="sm"
                    color="primary"
                    className="mt-0.5 shrink-0"
                    decorative
                />
            </button>

            {expanded && (
                <div className="flex flex-col gap-4 pb-4">
                    {root.body && <MessageBody body={root.body} className="mt-0" />}

                    {canAdd && !thread.isClosed && (
                        <div className="flex flex-col gap-2">
                            <ReplyButton
                                label={t("instance.messages.reply")}
                                onClick={() => onStartReply(root.id)}
                            />
                            {replyParentItemId === root.id && replyComposer}
                        </div>
                    )}

                    {replyTree.length > 0 && (
                        <div
                            className="flex flex-col gap-6 border-l border-grey-300 pl-4 dark:border-grey-600"
                            role="list"
                            aria-label={t("instance.messages.replies_heading")}
                        >
                            {replyTree.map((node) => (
                                <ReplyBranch
                                    key={node.id}
                                    node={node}
                                    visualDepth={1}
                                    canAdd={canAdd && !thread.isClosed}
                                    replyParentItemId={replyParentItemId}
                                    onStartReply={onStartReply}
                                    replyComposer={replyComposer}
                                />
                            ))}
                        </div>
                    )}

                    {canAdd && (
                        <div className="flex flex-wrap items-center gap-2 border-t border-grey-200 pt-3 dark:border-grey-700">
                            {thread.isClosed ? (
                                <Button
                                    intent="secondary"
                                    size="small"
                                    disabled={isLoading}
                                    onClick={onReopenConversation}
                                >
                                    {t("instance.messages.reopen_conversation")}
                                </Button>
                            ) : (
                                <Button
                                    intent="secondary"
                                    size="small"
                                    disabled={isLoading}
                                    onClick={onCloseConversation}
                                >
                                    {t("instance.messages.close_conversation")}
                                </Button>
                            )}
                        </div>
                    )}
                </div>
            )}
        </article>
    );
}

type ReplyBranchProps = {
    node: MessageTreeNode;
    visualDepth: number;
    canAdd: boolean;
    replyParentItemId: string | null;
    onStartReply: (parentItemId: string) => void;
    replyComposer: React.ReactNode;
};

function ReplyBranch({
    node,
    visualDepth,
    canAdd,
    replyParentItemId,
    onStartReply,
    replyComposer,
}: ReplyBranchProps) {
    const {t, i18n} = useTranslate("workflow");
    const isReplyingHere = replyParentItemId === node.id;
    const atMaxDepth = visualDepth >= MAX_REPLY_VISUAL_DEPTH;

    return (
        <div role="listitem" className="group/reply flex flex-col gap-2">
            <MessageMeta
                displayName={node.user.displayName}
                dateTime={node.dateTime}
                language={i18n.language}
                dateOnHover
            />
            {node.body && <MessageBody body={node.body} className="mt-1" />}
            {canAdd && (
                <div className="flex flex-col gap-2">
                    <ReplyButton
                        label={t("instance.messages.reply")}
                        onClick={() => onStartReply(node.id)}
                    />
                    {isReplyingHere && replyComposer}
                </div>
            )}
            {node.children.length > 0 && (
                <div
                    className={
                        atMaxDepth
                            ? "flex flex-col gap-6 pl-4"
                            : "flex flex-col gap-6 border-l border-grey-300 pl-4 dark:border-grey-600"
                    }
                    role="list"
                >
                    {node.children.map((child) => (
                        <ReplyBranch
                            key={child.id}
                            node={child}
                            visualDepth={Math.min(visualDepth + 1, MAX_REPLY_VISUAL_DEPTH)}
                            canAdd={canAdd}
                            replyParentItemId={replyParentItemId}
                            onStartReply={onStartReply}
                            replyComposer={replyComposer}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}
