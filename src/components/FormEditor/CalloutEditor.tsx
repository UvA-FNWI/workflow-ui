import {type ReactNode, useState} from "react";

import {Input, Pill, Radio, RadioGroup, TextArea} from "@uva-fnwi/datanose-ui";
import type {YAMLMap} from "yaml";

import {BilingualPair} from "~/components/FormEditor/BilingualPair";
import {FormElementCard, FormElementPreview} from "~/components/FormEditor/FormElementCard";
import {type ApplyFormEdit, readLocalText} from "~/components/FormEditor/model";
import {PageElement} from "~/components/instance/PageElement";
import {useTranslate} from "~/hooks/useTranslate";
import type {MessageVariant} from "~/store/api/types/submissions";

export function CalloutEditor({
    callout,
    content,
    formPath,
    apply,
    dragHandle,
}: {
    callout: YAMLMap;
    content: {variant?: unknown; title?: unknown; text?: unknown};
    formPath: string;
    apply: ApplyFormEdit;
    dragHandle: ReactNode;
}) {
    const {t, l} = useTranslate("form_editor");
    const [expanded, setExpanded] = useState(false);
    const labels: Record<MessageVariant, string> = {
        Info: t("callout_variants.info"),
        Warning: t("callout_variants.warning"),
        Error: t("callout_variants.error"),
        Success: t("callout_variants.success"),
        Note: t("callout_variants.note"),
    };
    const variant = typeof content.variant === "string" ? content.variant.toLowerCase() : "";
    const type =
        (Object.keys(labels) as MessageVariant[]).find((key) => key.toLowerCase() === variant) ??
        "Info";
    const title = content.title == null ? undefined : readLocalText(content.title);
    const text = content.text == null ? undefined : readLocalText(content.text);
    const pillColor =
        type === "Warning"
            ? "orange"
            : type === "Error"
              ? "red"
              : type === "Success"
                ? "green"
                : "grey";

    const textInput = (key: "title" | "text", label: string) => {
        const field = content[key];
        if (field !== null && typeof field === "object") {
            return (
                <BilingualPair
                    label={label}
                    value={readLocalText(field)}
                    multiline={key === "text"}
                    onChange={(language, value) =>
                        apply(() => {
                            callout.setIn([key, language], value);
                            return [formPath];
                        })
                    }
                />
            );
        }

        const Control = key === "text" ? TextArea : Input;
        return (
            <Control
                label={label}
                value={typeof field === "string" ? field : ""}
                onChange={(value) =>
                    apply(() => {
                        callout.set(key, value);
                        return [formPath];
                    })
                }
            />
        );
    };

    return (
        <FormElementCard
            dragHandle={dragHandle}
            expanded={expanded}
            onToggle={() => setExpanded((previous) => !previous)}
            title={<span className="truncate font-medium">{l(title) || t("callout")}</span>}
            actions={
                <Pill variant={pillColor} className="shrink-0">
                    {t("callout")} · {labels[type]}
                </Pill>
            }
            preview={
                <FormElementPreview>
                    <PageElement
                        element={{kind: "Callout", callout: {variant: type, title, text}}}
                        preview
                    />
                </FormElementPreview>
            }
        >
            <div className="space-y-3">
                <RadioGroup
                    label={t("callout_type")}
                    orientation="horizontal"
                    value={type}
                    onChange={(value) =>
                        apply(() => {
                            callout.set("variant", value.toLowerCase());
                            return [formPath];
                        })
                    }
                >
                    {Object.entries(labels).map(([key, label]) => (
                        <Radio key={key} value={key}>
                            {label}
                        </Radio>
                    ))}
                </RadioGroup>
                {textInput("title", t("callout_title"))}
                {textInput("text", t("callout_text"))}
            </div>
        </FormElementCard>
    );
}
