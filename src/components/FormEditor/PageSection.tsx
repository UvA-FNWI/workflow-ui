import {useRef, useState} from "react";

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
import {
    Button,
    Heading,
    Icon,
    type IconType,
    Popover,
    usePopoverState,
} from "@uva-fnwi/datanose-ui";

import {
    addQuestion,
    applyYamlToNode,
    type ConfigDocs,
    type EditorQuestion,
    nodeToYaml,
    pageMap,
    QUESTION_KINDS,
    type QuestionKind,
    readQuestions,
    reorderFields,
    requireDoc,
} from "~/components/FormEditor/model";
import {NodeYamlEditor} from "~/components/FormEditor/NodeYamlEditor";
import {QuestionCard} from "~/components/FormEditor/QuestionCard";
import {useTranslate} from "~/hooks/useTranslate";

type Props = {
    docs: ConfigDocs;
    formPath: string;
    pageName: string;
    pageTitle: string;
    apply: (action: () => string[]) => void;
};

const KIND_ICONS: Record<QuestionKind, IconType> = {
    TextField: "text-line",
    LongText: "text-block-line",
    Email: "email-line",
    Phone: "phone-line",
    Number: "hashtag-line",
    Decimal: "math-basic-line",
    Date: "calendar-line",
    YesNo: "autocheck-line",
    SingleChoice: "circle-line",
    MultipleChoice: "checkmark-line",
    Person: "user-line",
    People: "users-line",
    Document: "article-line",
};

function SortableCard({
    question,
    ...props
}: Omit<React.ComponentProps<typeof QuestionCard>, "dragHandle"> & {question: EditorQuestion}) {
    const {t} = useTranslate("workflow");
    const {attributes, listeners, setNodeRef, transform, transition, isDragging} = useSortable({
        id: question.name,
    });

    return (
        <div
            ref={setNodeRef}
            style={{transform: CSS.Transform.toString(transform), transition}}
            className={isDragging ? "opacity-60" : undefined}
        >
            <QuestionCard
                question={question}
                {...props}
                dragHandle={
                    <button
                        type="button"
                        className="cursor-grab rounded-xs p-1 focus-visible:ring-2 focus-visible:ring-navy-600 focus-visible:outline-none"
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

/** A hairline that becomes an add button on hover or focus, so questions can land between others. */
function InsertDivider({onAdd, isFirst}: {onAdd: (kind: QuestionKind) => void; isFirst?: boolean}) {
    const {t} = useTranslate("workflow");
    const popover = usePopoverState();
    const triggerRef = useRef<HTMLButtonElement>(null);

    return (
        <div className="group relative flex h-6 items-center justify-center">
            <div className="absolute inset-x-0 h-px bg-grey-200 opacity-0 transition-opacity group-focus-within:opacity-100 group-hover:opacity-100 dark:bg-grey-600" />
            <Button
                ref={triggerRef}
                intent="secondary"
                size="square"
                shape="circular"
                className="relative z-1 h-6 w-6 min-w-0 opacity-0 transition-opacity group-focus-within:opacity-100 group-hover:opacity-100 focus-visible:opacity-100"
                aria-label={isFirst ? t("form_editor.add_at_start") : t("form_editor.add_here")}
                aria-expanded={popover.isOpen}
                aria-haspopup="dialog"
                onClick={popover.toggle}
            >
                <Icon name="plus-line" size="sm" color="current" decorative />
            </Button>
            {popover.isOpen && (
                <Popover
                    state={popover}
                    triggerRef={triggerRef as React.RefObject<HTMLElement>}
                    placement="bottom"
                    className="border border-grey-400 bg-white shadow-md outline-none dark:bg-grey-800"
                >
                    <dialog
                        open
                        aria-label={t("form_editor.add_question")}
                        className="relative m-0 flex w-56 flex-col p-1"
                    >
                        {QUESTION_KINDS.map((kind) => (
                            <button
                                key={kind}
                                type="button"
                                onClick={() => {
                                    popover.close();
                                    onAdd(kind);
                                }}
                                className="flex w-full items-center gap-2 rounded-xs px-2 py-1.5 text-left text-sm hover:bg-grey-100 focus-visible:ring-2 focus-visible:ring-navy-600 focus-visible:outline-none dark:hover:bg-grey-700"
                            >
                                <Icon
                                    name={KIND_ICONS[kind]}
                                    size="sm"
                                    color="current"
                                    decorative
                                />
                                {t(`form_editor.kind.${kind}`)}
                            </button>
                        ))}
                    </dialog>
                </Popover>
            )}
        </div>
    );
}

export function PageSection({docs, formPath, pageName, pageTitle, apply}: Props) {
    const {t} = useTranslate("workflow");
    const [isYamlMode, setIsYamlMode] = useState(false);
    const questions = readQuestions(docs, formPath, pageName);
    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, {coordinateGetter: sortableKeyboardCoordinates}),
    );

    const onAdd = (kind: QuestionKind, index?: number) =>
        apply(
            () =>
                addQuestion(docs, formPath, pageName, kind, t("form_editor.new_question"), index)
                    .touched,
        );

    const onDragEnd = ({active, over}: DragEndEvent) => {
        if (!over || active.id === over.id) {
            return;
        }
        const from = questions.findIndex((question) => question.name === active.id);
        const to = questions.findIndex((question) => question.name === over.id);
        if (from >= 0 && to >= 0) {
            apply(() => reorderFields(docs, formPath, pageName, from, to));
        }
    };

    const node = pageMap(requireDoc(docs, formPath), pageName);

    return (
        <section>
            <div className="mb-3 flex items-center justify-between gap-3">
                <Heading as="h2" size="sm">
                    {pageTitle}
                </Heading>
                <Button
                    intent="ghost"
                    size="small"
                    leftIcon={
                        <Icon
                            name={isYamlMode ? "square-edit-line" : "code-brackets-line"}
                            size="sm"
                            color="current"
                            decorative
                        />
                    }
                    onClick={() => setIsYamlMode((previous) => !previous)}
                >
                    {isYamlMode ? t("form_editor.edit_visually") : t("form_editor.edit_page_yaml")}
                </Button>
            </div>

            {isYamlMode ? (
                <NodeYamlEditor
                    minHeight="16rem"
                    schema={{name: "Form", pointer: "#/definitions/Page"}}
                    initialText={node ? nodeToYaml(node) : ""}
                    onChange={(text) => {
                        if (!node) {
                            return null;
                        }
                        const error = applyYamlToNode(node, text);
                        if (error === null) {
                            apply(() => [formPath]);
                        }
                        return error;
                    }}
                />
            ) : (
                <DndContext sensors={sensors} onDragEnd={onDragEnd}>
                    <SortableContext
                        items={questions.map((question) => question.name)}
                        strategy={verticalListSortingStrategy}
                    >
                        <InsertDivider isFirst onAdd={(kind) => onAdd(kind, 0)} />
                        {questions.map((question, index) => (
                            <div key={question.name}>
                                <SortableCard
                                    docs={docs}
                                    formPath={formPath}
                                    pageName={pageName}
                                    question={question}
                                    apply={apply}
                                />
                                <InsertDivider onAdd={(kind) => onAdd(kind, index + 1)} />
                            </div>
                        ))}
                    </SortableContext>
                </DndContext>
            )}

            {!isYamlMode && questions.length === 0 && (
                <p className="py-2 text-sm text-grey-600">{t("form_editor.no_questions")}</p>
            )}
        </section>
    );
}
