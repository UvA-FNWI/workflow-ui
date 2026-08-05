import {useState} from "react";

import {Button, Icon, Link, Text, useToast} from "@uva-fnwi/datanose-ui";

import {InlineFileEdit} from "~/components/instance/InlineFileEdit.tsx";
import {InlineQuestionEdit} from "~/components/instance/InlineQuestionEdit.tsx";
import {useTranslate} from "~/hooks/useTranslate.ts";
import {answersApi} from "~/store/api/answersApi.ts";
import type {UserSearchResult} from "~/store/api/types/users.ts";
import {downloadFile} from "~/utils/fileDownload.ts";
import {formatAnswer} from "~/utils/formatAnswer.ts";
import type {QuestionAnswerPair} from "~/utils/submissionUtils.ts";

type Props = {
    pair?: QuestionAnswerPair;
    canEdit?: boolean;
    noAnswerText?: string;
    instanceId: string;
    submissionId?: string;
    showLinkedTitle?: boolean;
};

export const AnswerCell = ({
    pair,
    canEdit,
    noAnswerText,
    instanceId,
    submissionId,
    showLinkedTitle = false,
}: Props) => {
    const {i18n, l, t} = useTranslate(["workflow", "common"]);
    const [isEditing, setIsEditing] = useState(false);
    const [copied, setCopied] = useState(false);
    const toast = useToast();
    const [saveAnswer] = answersApi.endpoints.saveAnswer.useMutation();

    if (!pair) return <Text>-</Text>;

    const {answer} = pair;
    const formattedValue =
        answer != null
            ? formatAnswer(answer.value, pair.question.type, i18n.language, pair.question.choices)
            : noAnswerText;

    const answerTitleText = pair.columnTitle ?? pair?.submission?.form?.title;

    const handleCopyToClipboard = () => {
        try {
            navigator.clipboard.writeText(answer?.value as string);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch {
            toast.custom("warning", t("common:errors.clipboard_copy_failed"), {
                title: t("common:errors.warning_title"),
            });
        }
    };

    if (isEditing) {
        return (
            <InlineQuestionEdit
                question={pair.question}
                value={answer?.value}
                visibleChoices={answer?.visibleChoices}
                onSave={(value) =>
                    saveAnswer({
                        instanceId,
                        submissionId: pair.submission?.id ?? submissionId ?? "",
                        answer: {questionName: pair.question.name, value},
                    })
                }
                onSaveExternalUser={(answer) =>
                    saveAnswer({
                        instanceId,
                        submissionId: pair.submission?.id ?? submissionId ?? "",
                        answer,
                    }).unwrap()
                }
                onClose={() => setIsEditing(false)}
            />
        );
    }

    if (pair.question.type === "File" && answer != null) {
        return (
            <div className="min-w-0">
                {canEdit || pair.submission?.permissions.includes("Edit") ? (
                    <InlineFileEdit
                        question={pair.question}
                        answer={answer}
                        instanceId={instanceId}
                        submissionId={pair.submission?.id ?? submissionId ?? ""}
                    />
                ) : answer.value != null ? (
                    <Link
                        intent="primary"
                        underline
                        className="truncate"
                        onClick={() =>
                            downloadFile(
                                answer.files[0],
                                pair.question.name,
                                instanceId,
                                submissionId,
                            )
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

    if (pair.question.type === "User" && (pair.answer?.value as UserSearchResult)?.isExternal) {
        const user = pair.answer?.value as UserSearchResult;

        return (
            <div className="flex min-w-0 flex-col gap-1">
                <div className="flex flex-row items-center gap-1">
                    <Text>{user.displayName}</Text>
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
                {user.organization && <Text>{user.organization.name}</Text>}
                <Text>{user.email}</Text>
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
                        onClick={handleCopyToClipboard}
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
