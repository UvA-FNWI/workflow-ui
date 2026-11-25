import {useRef, useState} from "react";

import {
    Button,
    Heading,
    Icon,
    Menu,
    MenuItem,
    TextArea,
    usePopoverState,
} from "@uva-fnwi/datanose-ui";
import {isMap, type YAMLMap, type YAMLSeq} from "yaml";

import {BilingualPair} from "~/components/FormEditor/BilingualPair";
import {CalloutEditor} from "~/components/FormEditor/CalloutEditor";
import {
    addQuestion,
    type ApplyFormEdit,
    applyYamlToNode,
    type ConfigDocs,
    elementsSeq,
    isSortableElement,
    type LocalText,
    nodeToYaml,
    pageMap,
    type QuestionKind,
    readLocalText,
    readQuestions,
    reorderElements,
    requireDoc,
    updatePageTitle,
} from "~/components/FormEditor/model";
import {NodeYamlEditor} from "~/components/FormEditor/NodeYamlEditor";
import {QuestionCard} from "~/components/FormEditor/QuestionCard";
import {QuestionKindMenu} from "~/components/FormEditor/QuestionKindMenu";
import {SortableElement, SortableElements} from "~/components/FormEditor/SortableElements";
import {useTranslate} from "~/hooks/useTranslate";

type Props = {
    docs: ConfigDocs;
    formPath: string;
    pageName: string;
    pageTitle: LocalText | null;
    apply: ApplyFormEdit;
    localPreview?: boolean;
};

const elementIds = new WeakMap<YAMLMap, string>();
let nextElementId = 0;

// Keep each editor and drag handle attached to its YAML node as positions change.
function elementId(element: YAMLMap) {
    let id = elementIds.get(element);
    if (id === undefined) {
        id = String(++nextElementId);
        elementIds.set(element, id);
    }
    return id;
}

export function PageSection({docs, formPath, pageName, pageTitle, apply, localPreview}: Props) {
    const {t, l} = useTranslate("form_editor");
    const [isYamlMode, setIsYamlMode] = useState(false);
    const [isRenaming, setIsRenaming] = useState(false);
    const addMenu = usePopoverState();
    const addTriggerRef = useRef<HTMLButtonElement>(null);
    const questions = readQuestions(docs, formPath, pageName);
    const onAdd = (kind: QuestionKind) =>
        apply(() => addQuestion(docs, formPath, pageName, kind, t("new_question")).touched);

    const form = requireDoc(docs, formPath);
    const node = pageMap(form, pageName);
    const sequence = elementsSeq(form, pageName);
    const elements = sequence?.items ?? [];
    const sortableIds = elements.filter(isSortableElement).map(elementId);
    const addText = () =>
        apply(() => {
            if (!node) return [];
            const list = sequence ?? (form.createNode([]) as YAMLSeq);
            if (!sequence) node.set("elements", list);
            list.add(form.createNode({text: ""}));
            return [formPath];
        });
    const byName = new Map(questions.map((question) => [question.name, question]));

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
                <Menu
                    ariaLabel={t("page_options")}
                    trigger={({triggerProps, triggerRef}) => (
                        <Button
                            {...triggerProps}
                            ref={triggerRef}
                            intent="ghost"
                            size="square"
                            aria-label={t("page_options")}
                        >
                            <Icon name="dots-single-line" decorative />
                        </Button>
                    )}
                >
                    <MenuItem
                        id="page-edit-mode"
                        icon={isYamlMode ? "square-edit-line" : "code-brackets-line"}
                        label={isYamlMode ? t("edit_visually") : t("edit_page_yaml")}
                        onAction={() => {
                            setIsYamlMode((previous) => !previous);
                            setIsRenaming(false);
                        }}
                    />
                </Menu>
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
                            apply(() => [formPath], "yaml");
                        }
                        return error;
                    }}
                />
            ) : (
                <SortableElements
                    ids={sortableIds}
                    onMove={(from, to) =>
                        apply(() => reorderElements(docs, formPath, pageName, from, to))
                    }
                >
                    <div className="flex flex-col gap-2">
                        {elements.map((item, index) => {
                            if (!isMap(item)) return null;
                            const id = elementId(item);
                            const element = item.toJSON();
                            const question = byName.get(element.question);
                            if (!question) {
                                const callout = item.get("callout");
                                if (isMap(callout)) {
                                    return (
                                        <SortableElement
                                            key={id}
                                            id={id}
                                            label={
                                                l(readLocalText(element.callout.title)) ||
                                                t("callout")
                                            }
                                            disabled={sortableIds.length < 2}
                                        >
                                            {(dragHandle) => (
                                                <CalloutEditor
                                                    callout={callout}
                                                    content={element.callout}
                                                    formPath={formPath}
                                                    apply={apply}
                                                    dragHandle={dragHandle}
                                                />
                                            )}
                                        </SortableElement>
                                    );
                                }
                                if (element.text == null) return null;
                                const text = l(readLocalText(element.text))?.trim().split("\n")[0];
                                return (
                                    <SortableElement
                                        key={id}
                                        id={id}
                                        label={text?.slice(0, 60) || t("text_block")}
                                        disabled={sortableIds.length < 2}
                                    >
                                        {(dragHandle) => (
                                            <div className="flex items-start gap-2 rounded-sm border border-grey-200 p-3 dark:border-grey-700">
                                                <div className="text-grey-500">{dragHandle}</div>
                                                <div className="min-w-0 flex-1">
                                                    {isMap(item.get("text")) ? (
                                                        <BilingualPair
                                                            label={t("text_block")}
                                                            value={readLocalText(element.text)}
                                                            multiline
                                                            onChange={(language, value) =>
                                                                apply(() => {
                                                                    item.setIn(
                                                                        ["text", language],
                                                                        value,
                                                                    );
                                                                    return [formPath];
                                                                })
                                                            }
                                                        />
                                                    ) : (
                                                        <TextArea
                                                            label={t("text_block")}
                                                            value={String(element.text)}
                                                            onChange={(value) =>
                                                                apply(() => {
                                                                    item.set("text", value);
                                                                    return [formPath];
                                                                })
                                                            }
                                                        />
                                                    )}
                                                </div>
                                                <Button
                                                    intent="ghost"
                                                    size="square"
                                                    aria-label={t("remove_text_block")}
                                                    onClick={() =>
                                                        apply(() => {
                                                            sequence?.delete(index);
                                                            return [formPath];
                                                        })
                                                    }
                                                >
                                                    <Icon name="trash-line" size="sm" decorative />
                                                </Button>
                                            </div>
                                        )}
                                    </SortableElement>
                                );
                            }

                            return (
                                <SortableElement
                                    key={id}
                                    id={id}
                                    disabled={sortableIds.length < 2}
                                    label={l(question.text) || question.name}
                                >
                                    {(dragHandle) => (
                                        <QuestionCard
                                            docs={docs}
                                            formPath={formPath}
                                            pageName={pageName}
                                            question={question}
                                            apply={apply}
                                            dragHandle={dragHandle}
                                            localPreview={localPreview}
                                        />
                                    )}
                                </SortableElement>
                            );
                        })}
                    </div>
                </SortableElements>
            )}

            {!isYamlMode && elements.length === 0 && (
                <p className="py-2 text-sm text-grey-600">{t("no_elements")}</p>
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
                        {t("add_element")}
                    </Button>
                    {addMenu.isOpen && (
                        <QuestionKindMenu
                            label={t("add_element")}
                            state={addMenu}
                            triggerRef={addTriggerRef as React.RefObject<HTMLElement>}
                            onSelect={onAdd}
                            onAddText={addText}
                        />
                    )}
                </>
            )}
        </section>
    );
}
