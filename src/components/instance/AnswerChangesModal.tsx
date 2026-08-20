import {Button, Modal, Separator, Text} from "@uva-fnwi/datanose-ui";

import {useTranslate} from "~/hooks/useTranslate.ts";
import type {AnswerChange, Question} from "~/store/api/types/submissions.ts";
import {formatAnswer} from "~/utils/formatAnswer.ts";
import {formatDate, formatDateShort} from "~/utils/formatDate.ts";

type Props = {
    isOpen: boolean;
    onClose: () => void;
    question: Question;
    changes: AnswerChange[];
};

export const AnswerChangesModal = ({isOpen, onClose, question, changes}: Props) => {
    const {t, i18n} = useTranslate("workflow");

    return (
        <Modal isOpen={isOpen} onOpenChange={(open) => !open && onClose()} size="sm">
            <Modal.Header>{t("instance.summary.changes_title")}</Modal.Header>
            <Modal.Body className="flex flex-col gap-4">
                {changes.map((change, index) => (
                    <div
                        key={`${change.version}-${change.changedAt}`}
                        className="flex flex-col gap-2"
                    >
                        {index > 0 && <Separator />}
                        <Text display="block" fontWeight="semibold">
                            {t("instance.summary.change_version", {version: change.version})}
                        </Text>
                        <Text display="block" className="wrap-break-word whitespace-pre-wrap">
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
                            {change.changedBy
                                ? t("instance.summary.changed_on_by", {
                                      date: formatDateShort(change.changedAt, i18n.language),
                                      name: change.changedBy,
                                  })
                                : t("instance.summary.changed_on", {
                                      date: formatDateShort(change.changedAt, i18n.language),
                                  })}
                        </Text>
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
