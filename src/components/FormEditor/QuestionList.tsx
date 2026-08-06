import {type ComponentProps, useState} from "react";

import {
    DndContext,
    type DragEndEvent,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
} from "@dnd-kit/core";
import {
    SortableContext,
    sortableKeyboardCoordinates,
    useSortable,
    verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import {CSS} from "@dnd-kit/utilities";
import {Callout, Icon} from "@uva-fnwi/datanose-ui";

import {
    addChoice,
    addQuestion,
    type ConfigDocs,
    type QuestionKind,
    type QuestionPatch,
    readOnlyReason,
    readQuestions,
    removeChoice,
    removeField,
    reorderFields,
    updateChoice,
    updateQuestion,
} from "~/components/FormEditor/model";
import {QuestionRow} from "~/components/FormEditor/QuestionRow";
import {TypePalette} from "~/components/FormEditor/TypePalette";
import {useTranslate} from "~/hooks/useTranslate";

type Props = {
    docs: ConfigDocs;
    formPath: string;
    pageName: string;
    onChanged: (paths: string[]) => void;
};

function SortableQuestionRow({question, ...props}: ComponentProps<typeof QuestionRow>) {
    const {t} = useTranslate("workflow");
    const {attributes, listeners, setNodeRef, transform, transition} = useSortable({
        id: question.name,
    });

    return (
        <div ref={setNodeRef} style={{transform: CSS.Transform.toString(transform), transition}}>
            <QuestionRow
                question={question}
                {...props}
                dragHandle={
                    <button
                        type="button"
                        className="cursor-grab rounded-xs focus-visible:ring-2 focus-visible:ring-navy-600 focus-visible:outline-none"
                        {...attributes}
                        {...listeners}
                        aria-label={t("form_editor.drag_handle")}
                    >
                        <Icon name="chevron-grabber-vertical-line" decorative />
                    </button>
                }
            />
        </div>
    );
}

export function QuestionList({docs, formPath, pageName, onChanged}: Props) {
    const {t} = useTranslate("workflow");
    const [failure, setFailure] = useState<string | null>(null);
    const questions = readQuestions(docs, formPath, pageName);
    const missingCount = questions.filter(
        (question) => readOnlyReason(question) === "missing",
    ).length;
    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, {coordinateGetter: sortableKeyboardCoordinates}),
    );

    const run = (action: () => string[]) => {
        try {
            setFailure(null);
            onChanged(action());
        } catch {
            setFailure(t("form_editor.mutation_failed"));
        }
    };

    const onAdd = (kind: QuestionKind) =>
        run(
            () =>
                addQuestion(docs, formPath, pageName, kind, t("form_editor.new_question")).touched,
        );

    const onDragEnd = ({active, over}: DragEndEvent) => {
        if (!over || active.id === over.id) {
            return;
        }
        const from = questions.findIndex((question) => question.name === active.id);
        const to = questions.findIndex((question) => question.name === over.id);
        if (from < 0 || to < 0) {
            return;
        }
        run(() => reorderFields(docs, formPath, pageName, from, to));
    };

    return (
        <div>
            <TypePalette onAdd={onAdd} />
            {missingCount > 0 && (
                <Callout type="warning" className="mb-3">
                    {t("form_editor.missing_properties", {count: missingCount})}
                </Callout>
            )}
            {failure && (
                <Callout type="error" role="alert" className="mb-3">
                    {failure}
                </Callout>
            )}
            {questions.length === 0 && (
                <p className="py-4 text-sm text-grey-700">{t("form_editor.no_questions")}</p>
            )}
            <DndContext sensors={sensors} onDragEnd={onDragEnd}>
                <SortableContext
                    items={questions.map((question) => question.name)}
                    strategy={verticalListSortingStrategy}
                >
                    {questions.map((question) => (
                        <SortableQuestionRow
                            key={question.name}
                            question={question}
                            onChange={(patch: QuestionPatch) =>
                                run(() => updateQuestion(docs, formPath, question.name, patch))
                            }
                            onRemove={() =>
                                run(() => removeField(docs, formPath, pageName, question.name))
                            }
                            onAddChoice={() =>
                                run(() =>
                                    addChoice(
                                        docs,
                                        formPath,
                                        question.name,
                                        t("form_editor.new_choice"),
                                    ),
                                )
                            }
                            onUpdateChoice={(choiceName, textNl) =>
                                run(() =>
                                    updateChoice(docs, formPath, question.name, choiceName, textNl),
                                )
                            }
                            onRemoveChoice={(choiceName) =>
                                run(() => removeChoice(docs, formPath, question.name, choiceName))
                            }
                        />
                    ))}
                </SortableContext>
            </DndContext>
        </div>
    );
}
