import {describe, expect, it} from "vitest";

import {buildReplyTree} from "../messageTree";
import type {MessageItem} from "~/store/api/types/messages";

const baseItem = (id: string, parentItemId: string | null, body: string): MessageItem => ({
    id,
    parentItemId,
    dateTime: "2026-09-17T10:00:00Z",
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
