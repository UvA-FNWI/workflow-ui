import {Button, Modal, Separator, Text} from "@uva-fnwi/datanose-ui";

import {useTranslate} from "~/hooks/useTranslate.ts";
import type {AnswerChangeGroup, Question} from "~/store/api/types/submissions.ts";
import {formatAnswer} from "~/utils/formatAnswer.ts";
import {formatDate, formatDateShort} from "~/utils/formatDate.ts";

type Props = {
    isOpen: boolean;
    onClose: () => void;
    question: Question;
    changes: AnswerChangeGroup[];
};

export const AnswerChangesModal = ({isOpen, onClose, question, changes}: Props) => {
    const {t, i18n} = useTranslate("workflow");

    return (
        <Modal isOpen={isOpen} onOpenChange={(open) => !open && onClose()} size="sm">
            <Modal.Header>{t("instance.summary.changes_title")}</Modal.Header>
            <Modal.Body className="flex flex-col gap-4">
                {changes.map((group, groupIndex) => (
                    <div key={group.versionNumber} className="flex flex-col gap-2">
                        {groupIndex > 0 && <Separator />}
                        <Text display="block" fontWeight="semibold">
                            {t(
                                group.isInProgress
                                    ? "instance.summary.change_version_in_progress"
                                    : "instance.summary.change_version",
                                {version: group.versionNumber},
                            )}
                        </Text>
                        {group.changes.map((change, changeIndex) => {
                            const date = formatDateShort(change.changedAt, i18n.language);
                            const submitted = changeIndex === group.changes.length - 1;
                            const changedOn = submitted
                                ? t("instance.summary.submitted_on", {date})
                                : change.changedBy
                                  ? t("instance.summary.changed_on_by", {
                                        date,
                                        name: change.changedBy,
                                    })
                                  : t("instance.summary.changed_on", {date});

                            return (
                                <div key={change.changedAt} className="flex flex-col gap-2">
                                    {changeIndex > 0 && <Separator />}
                                    <Text
                                        display="block"
                                        className="wrap-break-word whitespace-pre-wrap"
                                    >
                                        {formatAnswer(
                                            change.value,
                                            question.type,
                                            i18n.language,
                                            question.choices,
                                        ) || "-"}
                                    </Text>
                                    <Text
                                        display="block"
                                        intent="secondary"
                                        title={formatDate(change.changedAt, i18n.language)}
                                    >
                                        {changedOn}
                                    </Text>
                                </div>
                            );
                        })}
                    </div>
                ))}
            </Modal.Body>
            <Modal.Footer>
                <Button size="large" intent="secondary" onClick={onClose}>
                    {t("cancel")}
                </Button>
            </Modal.Footer>
        </Modal>
    );
};
