import type {ReactNode} from "react";

import {Button, Text, TextArea} from "@uva-fnwi/datanose-ui";

import {handleMessageSubmitShortcut} from "./messageComposerShortcuts";

export type MessageComposerProps = {
    id?: string;
    body: string;
    error?: string;
    onChange: (value: string) => void;
    onSubmit: () => void;
    onCancel: () => void;
    onFocus?: () => void;
    cancelIntent: "ghost" | "secondary";
    submitLabel: string;
    cancelLabel: string;
    placeholder: string;
    callout?: ReactNode;
    expanded?: boolean;
    readOnly?: boolean;
    isLoading: boolean;
    autoFocus?: boolean;
};

export function MessageComposer({
    id,
    body,
    error,
    onChange,
    onSubmit,
    onCancel,
    onFocus,
    cancelIntent,
    submitLabel,
    cancelLabel,
    placeholder,
    callout,
    expanded = true,
    readOnly = false,
    isLoading,
    autoFocus,
}: MessageComposerProps) {
    const isReadOnly = isLoading || readOnly;
    const canSubmit = expanded && !isReadOnly && body.trim().length > 0;

    return (
        <div className="flex w-full flex-col gap-2">
            <TextArea
                id={id}
                aria-label={placeholder}
                className={expanded ? "w-full" : "min-h-10! w-full resize-none"}
                rows={expanded ? 3 : 1}
                value={body}
                onChange={isReadOnly ? undefined : onChange}
                onFocus={onFocus}
                readOnly={isReadOnly}
                autoFocus={autoFocus}
                placeholder={placeholder}
                onKeyDown={(event) => handleMessageSubmitShortcut(event, onSubmit, canSubmit)}
            />
            {error && (
                <Text role="alert" intent="error" size="sm">
                    {error}
                </Text>
            )}
            {callout}
            {expanded && (
                <div className="flex flex-wrap items-center gap-2">
                    <Button
                        intent="primary"
                        variant="destructive"
                        width="none"
                        disabled={!canSubmit}
                        onClick={onSubmit}
                    >
                        {submitLabel}
                    </Button>
                    <Button intent={cancelIntent} disabled={isLoading} onClick={onCancel}>
                        {cancelLabel}
                    </Button>
                </div>
            )}
        </div>
    );
}
