import {Separator} from "@uva-fnwi/datanose-ui";

import {MessageBody, MessageMeta} from "./messageMeta";
import {newestMessageFirst} from "./messageTree";
import {useTranslate} from "~/hooks/useTranslate";
import type {MessageItem, MessageThread} from "~/store/api/types/messages";

type Props = {
    threads: MessageThread[];
};

function flatItems(threads: MessageThread[]): MessageItem[] {
    return threads
        .flatMap((thread) => thread.items.filter((item) => item.kind === "Message"))
        .sort(newestMessageFirst);
}

export function FlatMessageFeed({threads}: Props) {
    const {i18n} = useTranslate("workflow");
    const items = flatItems(threads);

    if (items.length === 0) return null;

    return (
        <div className="flex flex-col">
            {items.map((item, index) => (
                <div key={item.id}>
                    {index > 0 && <Separator />}
                    <article className="py-4">
                        <MessageMeta
                            displayName={item.user.displayName}
                            dateTime={item.dateTime}
                            language={i18n.language}
                        />
                        {item.body && <MessageBody body={item.body} className="mt-1" />}
                    </article>
                </div>
            ))}
        </div>
    );
}
