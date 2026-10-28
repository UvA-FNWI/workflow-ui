import {useState} from "react";

import {Button, Checkbox, Disclosure, Heading, Icon} from "@uva-fnwi/datanose-ui";

import {MessageThreadPanel} from "./MessageThreadPanel";
import {shouldShowMessageUi} from "./messageVisibility";
import {useTranslate} from "~/hooks/useTranslate";
import {messagesEndpoints} from "~/store/api/messagesApi";
import type {WorkflowInstance} from "~/store/api/types/instances";

type Props = {
    instance: WorkflowInstance;
};

export function CommentsCard({instance}: Props) {
    const {t} = useTranslate("workflow");
    const enabled = instance.workflowDefinition.messagesEnabled === true;
    const {data: threads = [], isSuccess: messagesLoaded} = messagesEndpoints.getMessages.useQuery(
        instance.id,
        {skip: !enabled},
    );
    const [showClosed, setShowClosed] = useState(false);
    const [expanded, setExpanded] = useState(false);
    const [composing, setComposing] = useState(false);

    if (!enabled) return null;

    const instanceThreads = threads.filter((thread) => thread.questionName == null);
    const canAdd = instance.permissions.includes("AddInstanceMessage");
    if (!canAdd && !messagesLoaded) return null;
    if (!shouldShowMessageUi(canAdd, instanceThreads.length)) return null;

    const closedCount = instanceThreads.filter((thread) => thread.isClosed).length;
    const title = t("instance.messages.heading", {
        title: t("instance.messages.title"),
        audience: t("instance.messages.audience"),
    });

    const startNote = () => {
        if (composing) {
            setComposing(false);
            return;
        }
        setExpanded(true);
        setComposing(true);
    };

    return (
        <Disclosure
            isExpanded={expanded}
            onExpandedChange={(open) => {
                setExpanded(open);
                if (!open) setComposing(false);
            }}
        >
            <div className="flex flex-row items-center justify-between">
                <Disclosure.Header>
                    <Heading className="font-semibold">{title}</Heading>
                </Disclosure.Header>
                {canAdd && (
                    <div className="pr-6">
                        <Button
                            intent="secondary"
                            variant="destructive"
                            size="square"
                            width="none"
                            className="flex items-center justify-center leading-0"
                            aria-label={t("instance.messages.add")}
                            aria-pressed={composing}
                            onClick={startNote}
                        >
                            <Icon name="plus-solid" color="current" />
                        </Button>
                    </div>
                )}
            </div>
            <Disclosure.Content>
                <div className="flex flex-col gap-3 pt-2">
                    {closedCount > 0 && (
                        <Checkbox
                            className="shrink-0"
                            label={t("instance.messages.closed_count", {count: closedCount})}
                            isSelected={showClosed}
                            onChange={setShowClosed}
                        />
                    )}
                    <MessageThreadPanel
                        instanceId={instance.id}
                        threads={instanceThreads}
                        canAdd={canAdd}
                        showClosed={showClosed}
                        onShowClosedChange={setShowClosed}
                        composerFirst
                        showNewComposer={composing}
                        autoFocusComposer={composing}
                        onDismissComposer={() => setComposing(false)}
                    />
                </div>
            </Disclosure.Content>
        </Disclosure>
    );
}
