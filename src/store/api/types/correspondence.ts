export type CorrespondenceRecipientType = "To" | "Cc" | "Bcc";

export type CorrespondenceRecipient = {
    name: string;
    email: string;
    type: CorrespondenceRecipientType;
};

export type Correspondence = {
    id: string;
    subject: string;
    timestamp: Date;
    body: string;
    recipients: CorrespondenceRecipient[];
    attachments: string[];
};
