import type {MessageItem} from "~/store/api/types/messages";

export type MessageTreeNode = MessageItem & {
    children: MessageTreeNode[];
};

/** Builds nested reply nodes under the conversation opener (first message item). */
export function buildReplyTree(items: MessageItem[]): MessageTreeNode[] {
    const messages = items.filter((item) => item.kind === "Message");
    if (messages.length <= 1) return [];

    const rootId = messages[0].id;
    const nodes = new Map<string, MessageTreeNode>(
        messages.map((message) => [message.id, {...message, children: []}]),
    );

    for (const message of messages.slice(1)) {
        const parentId = message.parentItemId ?? rootId;
        const parent = nodes.get(parentId) ?? nodes.get(rootId);
        const node = nodes.get(message.id);
        if (parent && node) parent.children.push(node);
    }

    return nodes.get(rootId)?.children ?? [];
}
