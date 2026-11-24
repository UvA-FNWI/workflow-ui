import type {MessageItem, MessageThread} from "~/store/api/types/messages";

export type MessageTreeNode = MessageItem & {
    children: MessageTreeNode[];
};

export function getConversationOpener(items: MessageItem[]): MessageItem | undefined {
    return items.find((item) => item.kind === "Message");
}

export function newestMessageFirst(a: MessageItem, b: MessageItem): number {
    return Date.parse(b.dateTime) - Date.parse(a.dateTime);
}

export function orderConversationThreads(threads: MessageThread[]): MessageThread[] {
    return threads
        .flatMap((thread) => {
            const opener = getConversationOpener(thread.items);
            return opener ? [{thread, opener}] : [];
        })
        .sort((a, b) => {
            if (a.thread.isClosed !== b.thread.isClosed) return a.thread.isClosed ? 1 : -1;
            return newestMessageFirst(a.opener, b.opener);
        })
        .map(({thread}) => thread);
}

/** Builds nested reply nodes under the conversation opener (first message item). */
export function buildReplyTree(items: MessageItem[]): MessageTreeNode[] {
    const messages = items.filter((item) => item.kind === "Message");
    if (messages.length <= 1) return [];

    const rootId = messages[0].id;
    const nodes = new Map<string, MessageTreeNode>(
        messages.map((message) => [message.id, {...message, children: []}]),
    );

    for (const message of messages.slice(1).sort(newestMessageFirst)) {
        const parentId = message.parentItemId ?? rootId;
        const parent = nodes.get(parentId) ?? nodes.get(rootId);
        const node = nodes.get(message.id);
        if (parent && node) parent.children.push(node);
    }

    return nodes.get(rootId)?.children ?? [];
}
