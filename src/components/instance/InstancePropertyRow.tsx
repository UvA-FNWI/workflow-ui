import {useState} from "react";

import {Button, Icon, Text} from "@uva-fnwi/datanose-ui";

import {InlineQuestionEdit} from "~/components/instance/InlineQuestionEdit.tsx";
import {useTranslate} from "~/hooks/useTranslate.ts";
import type {DataType, Question} from "~/store/api/types/submissions.ts";
import {formatAnswer} from "~/utils/formatAnswer.ts";

type Props = {
    question: Question;
    /** Dotted path from the instance root. */
    path: string;
    values: Record<string, unknown>;
    onSave: (path: string, value: unknown) => Promise<{error?: unknown}>;
};

const ROW_CLASSES = "grid gap-1 sm:grid-cols-[minmax(0,1fr)_minmax(0,2fr)] sm:gap-4";
const EDITABLE_TYPES: DataType[] = ["String", "Int", "Double", "Date", "User", "Boolean", "Choice"];

export const InstancePropertyRow = ({question, path, values, onSave}: Props) => {
    const {i18n, l, t} = useTranslate("workflow");
    const [isEditing, setIsEditing] = useState(false);

    // Embedded objects render as groups with editable children.
    const children =
        question.type === "Object" && !question.isArray ? question.subProperties : null;

    const value = values[path];
    const label = l(question.text) ?? question.name;

    if (children?.length) {
        return (
            <div className="flex flex-col gap-2">
                <Text fontWeight="semibold">{label}</Text>
                <div className="flex flex-col gap-2 border-l-2 border-grey-200 pl-4">
                    {children.map((child) => (
                        <InstancePropertyRow
                            key={`${path}.${child.name}`}
                            question={child}
                            path={`${path}.${child.name}`}
                            values={values}
                            onSave={onSave}
                        />
                    ))}
                </div>
            </div>
        );
    }

    if (isEditing) {
        return (
            <div className={ROW_CLASSES}>
                <Text fontWeight="semibold">{label}</Text>
                <InlineQuestionEdit
                    question={question}
                    value={value}
                    onSave={(newValue) => onSave(path, newValue)}
                    onClose={() => setIsEditing(false)}
                />
            </div>
        );
    }

    const formatted = formatAnswer(value, question.type, i18n.language, question.choices);

    return (
        <div className={ROW_CLASSES}>
            <div className="min-w-0">
                <Text fontWeight="semibold">{label}</Text>
                {/* Show the path used by definitions and the change log. */}
                {label !== path && (
                    <Text size="sm" intent="secondary" display="block" className="wrap-break-word">
                        {path}
                    </Text>
                )}
            </div>
            <div className="min-w-0">
                <Text as="span" display="inline" className="wrap-break-word whitespace-pre-wrap">
                    {formatted || "-"}
                </Text>
                {EDITABLE_TYPES.includes(question.type) && (
                    <Button
                        intent="ghost"
                        size="small"
                        shape="circular"
                        className="ui:ml-1 ui:border-0 ui:px-1 ui:align-middle ui:hover:enabled:bg-grey-100 ui:dark:hover:enabled:bg-grey-800"
                        onClick={() => setIsEditing(true)}
                        aria-label={t("admin_data.edit_property", {property: label})}
                    >
                        <Icon name="edit-line" size="xs" color="danger" />
                    </Button>
                )}
            </div>
        </div>
    );
};
