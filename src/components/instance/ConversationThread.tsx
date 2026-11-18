import {Button, Icon, TextArea} from "@uva-fnwi/datanose-ui";

import {MessageBody, MessageMeta} from "./messageMeta";
import {buildReplyTree, type MessageTreeNode} from "./messageTree";
import {useTranslate} from "~/hooks/useTranslate";
import type {MessageItem, MessageThread} from "~/store/api/types/messages";

/** Cap reply indent so deep API trees do not become a ladder of rails. */
const MAX_REPLY_VISUAL_DEPTH = 2;

type Props = {
    thread: MessageThread;
    expanded: boolean;
    onExpandedChange: (open: boolean) => void;
    canAdd: boolean;
    allowClose: boolean;
    replyParentItemId: string | null;
    onStartReply: (parentItemId: string) => void;
    onCloseConversation: () => void;
    onReopenConversation: () => void;
    isLoading: boolean;
    replyComposer: React.ReactNode;
    replyPlaceholder: string;
};

function messageItems(thread: MessageThread): MessageItem[] {
    return thread.items.filter((item) => item.kind === "Message");
}

function ReplyInlineStarter({
    ariaLabel,
    placeholder,
    isActive,
    onFocus,
    replyComposer,
}: {
    ariaLabel: string;
    placeholder: string;
    isActive: boolean;
    onFocus: () => void;
    replyComposer: React.ReactNode;
}) {
    if (isActive) {
        return <div className="w-full">{replyComposer}</div>;
    }

    return (
        <TextArea
            aria-label={ariaLabel}
            rows={1}
            className="min-h-10! w-full resize-none"
            placeholder={placeholder}
            value=""
            onChange={() => {}}
            onFocus={onFocus}
        />
    );
}

export function ConversationThread({
    thread,
    expanded,
    onExpandedChange,
    canAdd,
    allowClose,
    replyParentItemId,
    onStartReply,
    onCloseConversation,
    onReopenConversation,
    isLoading,
    replyComposer,
    replyPlaceholder,
}: Props) {
    const {t: m, i18n} = useTranslate("workflow", {keyPrefix: "instance.messages"});
    const replyAriaLabel = m("reply_placeholder", {defaultValue: "Write a reply"});
    const items = messageItems(thread);
    const root = items[0];

    if (!root) return null;

    const replyTree = buildReplyTree(thread.items);
    const toggleLabel = expanded ? m("collapse_conversation") : m("expand_conversation");
    const closedLabel = m("closed");
    const closedSuffix = allowClose && thread.isClosed ? closedLabel : undefined;

    const toggle = () => onExpandedChange(!expanded);

    return (
        <article className={allowClose && thread.isClosed ? "opacity-60" : undefined}>
            <button
                type="button"
                className="flex w-full min-w-0 items-start justify-between gap-4 py-4 text-left transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
                aria-expanded={expanded}
                aria-label={toggleLabel}
                onClick={toggle}
            >
                <div className="min-w-0 flex-1">
                    <MessageMeta
                        displayName={root.user.displayName}
                        dateTime={root.dateTime}
                        language={i18n.language}
                        suffix={closedSuffix}
                        truncate
                    />
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

                    {canAdd && (!allowClose || !thread.isClosed) && (
                        <ReplyInlineStarter
                            ariaLabel={replyAriaLabel}
                            placeholder={replyPlaceholder}
                            isActive={replyParentItemId === root.id}
                            onFocus={() => onStartReply(root.id)}
                            replyComposer={replyComposer}
                        />
                    )}

                    {replyTree.length > 0 && (
                        <div
                            className="flex flex-col gap-6 border-l border-grey-300 pl-4 dark:border-grey-600"
                            role="list"
                            aria-label={m("replies_heading")}
                        >
                            {replyTree.map((node) => (
                                <ReplyBranch
                                    key={node.id}
                                    node={node}
                                    visualDepth={1}
                                    canAdd={canAdd && (!allowClose || !thread.isClosed)}
                                    replyParentItemId={replyParentItemId}
                                    onStartReply={onStartReply}
                                    replyComposer={replyComposer}
                                    replyPlaceholder={replyPlaceholder}
                                    replyAriaLabel={replyAriaLabel}
                                />
                            ))}
                        </div>
                    )}

                    {canAdd && allowClose && (
                        <div className="flex flex-wrap items-center gap-2 border-t border-grey-200 pt-3 dark:border-grey-700">
                            {thread.isClosed ? (
                                <Button
                                    intent="secondary"
                                    width="none"
                                    disabled={isLoading}
                                    onClick={onReopenConversation}
                                >
                                    {m("reopen_conversation")}
                                </Button>
                            ) : (
                                <Button
                                    intent="secondary"
                                    width="none"
                                    disabled={isLoading}
                                    onClick={onCloseConversation}
                                >
                                    {m("close_conversation")}
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
    replyPlaceholder: string;
    replyAriaLabel: string;
};

function ReplyBranch({
    node,
    visualDepth,
    canAdd,
    replyParentItemId,
    onStartReply,
    replyComposer,
    replyPlaceholder,
    replyAriaLabel,
}: ReplyBranchProps) {
    const {i18n} = useTranslate("workflow", {keyPrefix: "instance.messages"});
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
                <ReplyInlineStarter
                    ariaLabel={replyAriaLabel}
                    placeholder={replyPlaceholder}
                    isActive={isReplyingHere}
                    onFocus={() => onStartReply(node.id)}
                    replyComposer={replyComposer}
                />
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
                            replyPlaceholder={replyPlaceholder}
                            replyAriaLabel={replyAriaLabel}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}
