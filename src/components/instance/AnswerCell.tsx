import {useState} from "react";

import {Button, Icon, Link, Text} from "@uva-fnwi/datanose-ui";

import {InlineQuestionEdit} from "~/components/instance/InlineQuestionEdit.tsx";
import {useTranslate} from "~/hooks/useTranslate.ts";
import type {Question} from "~/store/api/types/submissions.ts";
import {downloadFile} from "~/utils/fileDownload.ts";
import {formatAnswer} from "~/utils/formatAnswer.ts";
import type {QuestionAnswerPair} from "~/utils/submissionUtils.ts";

type Props = {
    question: Question;
    pair: QuestionAnswerPair | undefined;
    canEdit?: boolean;
    noAnswerText?: string;
    instanceId: string;
    submissionId?: string;
    showLinkedTitle?: boolean;
};

export const AnswerCell = ({
    question,
    pair,
    canEdit,
    noAnswerText,
    instanceId,
    submissionId,
    showLinkedTitle = false,
}: Props) => {
    const {i18n, l, t} = useTranslate("workflow");
    const [isEditing, setIsEditing] = useState(false);
    const [copied, setCopied] = useState(false);

    if (!pair) return <span />;

    const {answer} = pair;
    const formattedValue =
        answer != null
            ? formatAnswer(answer.value, question.type, i18n.language, question.choices)
            : noAnswerText;

    const answerTitleText = pair.columnTitle ?? pair?.submission?.form?.title;
    if (isEditing) {
        return (
            <InlineQuestionEdit
                question={question}
                answer={answer}
                instanceId={instanceId}
                submissionId={pair.submission?.id ?? submissionId ?? ""}
                onClose={() => setIsEditing(false)}
            />
        );
    }

    if (question.type === "File" && answer != null) {
        return (
            <div className="min-w-0">
                {answer.value != null ? (
                    <Link
                        intent="primary"
                        underline
                        className="truncate"
                        onClick={() =>
                            downloadFile(answer.files[0], question.name, instanceId, submissionId)
                        }
                    >
                        {formattedValue}
                    </Link>
                ) : (
                    <Text className="min-w-0 wrap-break-word whitespace-pre-wrap">
                        {formattedValue ? formattedValue : "-"}
                    </Text>
                )}
            </div>
        );
    }

    return (
        <div className="flex min-w-0 flex-col">
            {showLinkedTitle && (
                <div>
                    <Text fontWeight="semibold" className="mb-1">
                        {t("instance.summary.explanation")}
                        {answerTitleText && ` ${l(answerTitleText)}`}
                    </Text>
                    <Button
                        intent="ghost"
                        size="small"
                        shape="circular"
                        className="border-0 px-1 align-top"
                        onClick={() => {
                            navigator.clipboard.writeText(answer?.value as string);
                            setCopied(true);
                            setTimeout(() => setCopied(false), 2000);
                        }}
                    >
                        <Icon
                            name={copied ? "checkmark-line" : "copy-line"}
                            size="sm"
                            color="danger"
                        />
                    </Button>
                </div>
            )}
            <div>
                <Text as="span" display="inline" className="wrap-break-word whitespace-pre-wrap">
                    {formattedValue ? formattedValue : "-"}
                </Text>
                {(canEdit || pair.submission?.permissions.includes("Edit")) && (
                    <Button
                        intent="ghost"
                        size="small"
                        shape="circular"
                        className="ui:ml-1 ui:border-0 ui:px-1 ui:align-middle ui:hover:enabled:bg-grey-100 ui:dark:hover:enabled:bg-grey-800"
                        onClick={() => setIsEditing(true)}
                        aria-label={t("instance.summary.edit_answer")}
                    >
                        <Icon name="edit-line" size="xs" color="danger" />
                    </Button>
                )}
            </div>
        </div>
    );
};
