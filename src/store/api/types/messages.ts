export type MessageUser = {
    id: string;
    displayName: string;
};

export type MessageItemKind = "Message" | "Close" | "Reopen";

export type MessageItem = {
    id: string;
    parentItemId: string | null;
    dateTime: string;
    user: MessageUser;
    body: string | null;
    kind: MessageItemKind;
};

export type MessageThread = {
    id: string;
    questionName: string | null;
    isClosed: boolean;
    items: MessageItem[];
};

export type AddMessageBody = {
    questionName?: string | null;
    replyToId?: string | null;
    parentItemId?: string | null;
    kind?: MessageItemKind;
    body?: string | null;
};
