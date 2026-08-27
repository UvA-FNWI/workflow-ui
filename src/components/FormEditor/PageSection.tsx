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
import {Button, Heading, Icon, usePopoverState} from "@uva-fnwi/datanose-ui";

import {BilingualPair} from "~/components/FormEditor/BilingualPair";
import {
    addQuestion,
    applyYamlToNode,
    type ConfigDocs,
    type EditorQuestion,
    type LocalText,
    nodeToYaml,
    pageMap,
    type QuestionKind,
    readQuestions,
    reorderFields,
    requireDoc,
    updatePageTitle,
} from "~/components/FormEditor/model";
import {NodeYamlEditor} from "~/components/FormEditor/NodeYamlEditor";
import {QuestionCard} from "~/components/FormEditor/QuestionCard";
import {QuestionKindMenu} from "~/components/FormEditor/QuestionKindMenu";
import {useTranslate} from "~/hooks/useTranslate";

type Props = {
    docs: ConfigDocs;
    formPath: string;
    pageName: string;
    pageTitle: LocalText | null;
    apply: (action: () => string[]) => void;
};

function SortableCard({
    question,
    ...props
}: Omit<React.ComponentProps<typeof QuestionCard>, "dragHandle"> & {question: EditorQuestion}) {
    const {t} = useTranslate("form_editor");
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
                        aria-label={t("drag_handle")}
                    >
                        <Icon name="chevron-grabber-vertical-line" decorative />
                    </button>
                }
            />
        </div>
    );
}

export function PageSection({docs, formPath, pageName, pageTitle, apply}: Props) {
    const {t, l} = useTranslate("form_editor");
    const [isYamlMode, setIsYamlMode] = useState(false);
    const [isRenaming, setIsRenaming] = useState(false);
    const addMenu = usePopoverState();
    const addTriggerRef = useRef<HTMLButtonElement>(null);
    const questions = readQuestions(docs, formPath, pageName);
    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, {coordinateGetter: sortableKeyboardCoordinates}),
    );

    const onAdd = (kind: QuestionKind) =>
        apply(() => addQuestion(docs, formPath, pageName, kind, t("new_question")).touched);

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
                <div className="flex min-w-0 items-center gap-1">
                    <Heading as="h2" size="sm">
                        {l(pageTitle) || pageName}
                    </Heading>
                    <Button
                        intent="ghost"
                        size="square"
                        aria-label={t("rename_page")}
                        aria-expanded={isRenaming}
                        onClick={() => setIsRenaming((previous) => !previous)}
                    >
                        <Icon name="square-edit-line" size="sm" decorative />
                    </Button>
                </div>
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
                    {isYamlMode ? t("edit_visually") : t("edit_page_yaml")}
                </Button>
            </div>

            {isRenaming && (
                <div className="mb-4">
                    <BilingualPair
                        label={t("page_title")}
                        value={pageTitle ?? {nl: "", en: ""}}
                        onChange={(language, next) =>
                            apply(() => updatePageTitle(docs, formPath, pageName, language, next))
                        }
                    />
                </div>
            )}

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
                        <div className="flex flex-col gap-2">
                            {questions.map((question) => (
                                <SortableCard
                                    key={question.name}
                                    docs={docs}
                                    formPath={formPath}
                                    pageName={pageName}
                                    question={question}
                                    apply={apply}
                                />
                            ))}
                        </div>
                    </SortableContext>
                </DndContext>
            )}

            {!isYamlMode && questions.length === 0 && (
                <p className="py-2 text-sm text-grey-600">{t("no_questions")}</p>
            )}

            {!isYamlMode && (
                <>
                    <Button
                        ref={addTriggerRef}
                        intent="secondary"
                        size="small"
                        className="mt-3 w-full"
                        leftIcon={<Icon name="plus-line" size="sm" color="current" decorative />}
                        aria-expanded={addMenu.isOpen}
                        aria-haspopup="dialog"
                        onClick={addMenu.toggle}
                    >
                        {t("add_question")}
                    </Button>
                    {addMenu.isOpen && (
                        <QuestionKindMenu
                            label={t("add_question")}
                            state={addMenu}
                            triggerRef={addTriggerRef as React.RefObject<HTMLElement>}
                            onSelect={onAdd}
                        />
                    )}
                </>
            )}
        </section>
    );
}
