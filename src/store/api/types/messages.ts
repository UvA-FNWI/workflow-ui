export type MessageUser = {
    id: string;
    displayName: string;
};

export type MessageItemKind = "Message" | "Close";

export type MessageItem = {
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
    kind?: MessageItemKind;
    body?: string | null;
};
