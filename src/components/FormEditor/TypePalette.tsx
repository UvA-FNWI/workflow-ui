import {Button, Icon, type IconType} from "@uva-fnwi/datanose-ui";

import {QUESTION_KINDS, type QuestionKind} from "~/components/FormEditor/model";
import {useTranslate} from "~/hooks/useTranslate";

const ICONS: Record<QuestionKind, IconType> = {
    Document: "article-line",
    TextField: "edit-line",
    LongText: "bullet-list-line",
    Date: "calendar-line",
    SingleChoice: "checkmark-line",
    MultipleChoice: "checkmark-line",
};

export function TypePalette({onAdd}: {onAdd: (kind: QuestionKind) => void}) {
    const {t} = useTranslate("workflow");

    return (
        <div className="mb-4 flex flex-wrap gap-2">
            {QUESTION_KINDS.map((kind) => (
                <Button
                    key={kind}
                    intent="secondary"
                    leftIcon={<Icon name={ICONS[kind]} decorative />}
                    onClick={() => onAdd(kind)}
                >
                    {t(`form_editor.kind.${kind}`)}
                </Button>
            ))}
        </div>
    );
}
