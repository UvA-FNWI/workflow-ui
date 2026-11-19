import {describe, expect, it} from "vitest";

import {buildReplyTree, getConversationOpener} from "../messageTree";
import type {MessageItem} from "~/store/api/types/messages";

const baseItem = (
    id: string,
    parentItemId: string | null,
    body: string,
    dateTime = "2026-09-17T10:00:00Z",
): MessageItem => ({
    id,
    parentItemId,
    dateTime,
    user: {id: "u1", displayName: "Ada"},
    body,
    kind: "Message",
});

describe("buildReplyTree", () => {
    it("nests replies under the correct parent", () => {
        const items: MessageItem[] = [
            baseItem("root", null, "Root"),
            baseItem("a", "root", "A"),
            baseItem("b", "a", "B"),
        ];

        const tree = buildReplyTree(items);
        expect(tree).toHaveLength(1);
        expect(tree[0].id).toBe("a");
        expect(tree[0].children[0].id).toBe("b");
    });

    it("orders replies newest first among siblings at every depth", () => {
        const opener = baseItem("root", null, "Root");
        const items: MessageItem[] = [
            {...baseItem("reopen", null, ""), kind: "Reopen", body: null},
            opener,
            baseItem("older", "root", "Older reply", "2026-09-17T11:00:00Z"),
            baseItem("older-child", "older", "Older nested reply", "2026-09-17T12:00:00Z"),
            baseItem("newer", "root", "Newer reply", "2026-09-17T13:00:00Z"),
            baseItem("newer-child", "older", "Newer nested reply", "2026-09-17T14:00:00Z"),
        ];

        const tree = buildReplyTree(items);

        expect(getConversationOpener(items)).toBe(opener);
        expect(tree.map(({id}) => id)).toEqual(["newer", "older"]);
        expect(tree[1].children.map(({id}) => id)).toEqual(["newer-child", "older-child"]);
    });

    it("treats legacy flat replies as direct children of the opener", () => {
        const items: MessageItem[] = [
            baseItem("root", null, "Root"),
            baseItem("legacy", null, "Legacy reply"),
        ];

        const tree = buildReplyTree(items);
        expect(tree).toHaveLength(1);
        expect(tree[0].id).toBe("legacy");
    });
});
