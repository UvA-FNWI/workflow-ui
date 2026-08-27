import {Icon, type IconType, Popover, type PopoverState} from "@uva-fnwi/datanose-ui";

import {QUESTION_KINDS, type QuestionKind} from "~/components/FormEditor/model";
import {useTranslate} from "~/hooks/useTranslate";

const KIND_ICONS: Record<QuestionKind, IconType> = {
    TextField: "text-line",
    Email: "email-line",
    Phone: "phone-line",
    Number: "hashtag-line",
    Date: "calendar-line",
    YesNo: "autocheck-line",
    SingleChoice: "circle-line",
    MultipleChoice: "checkmark-line",
    Person: "user-line",
    People: "users-line",
    Document: "article-line",
};

type Props = {
    /** Accessible name of the list, since the two triggers mean different things by it. */
    label: string;
    state: PopoverState;
    triggerRef: React.RefObject<HTMLElement>;
    onSelect: (kind: QuestionKind) => void;
    selectedKind?: QuestionKind | "Unknown";
};

/** The kind list, shared by "add a question" and by the type pill on a question card. */
export function QuestionKindMenu({label, state, triggerRef, onSelect, selectedKind}: Props) {
    const {t} = useTranslate("form_editor");

    return (
        <Popover
            state={state}
            triggerRef={triggerRef}
            placement="bottom"
            className="border border-grey-400 bg-white shadow-md outline-none dark:bg-grey-800"
        >
            <dialog open aria-label={label} className="relative m-0 flex w-56 flex-col p-1">
                {QUESTION_KINDS.map((kind) => (
                    <button
                        key={kind}
                        type="button"
                        aria-current={kind === selectedKind}
                        onClick={() => {
                            state.close();
                            onSelect(kind);
                        }}
                        className={`flex w-full items-center gap-2 rounded-xs px-2 py-1.5 text-left text-sm hover:bg-grey-100 focus-visible:ring-2 focus-visible:ring-navy-600 focus-visible:outline-none dark:hover:bg-grey-700 ${
                            kind === selectedKind ? "font-medium" : ""
                        }`}
                    >
                        <Icon name={KIND_ICONS[kind]} size="sm" color="current" decorative />
                        {t(`kind.${kind}`)}
                    </button>
                ))}
            </dialog>
        </Popover>
    );
}
