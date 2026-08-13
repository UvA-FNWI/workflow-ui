import {type ReactNode, useRef, useState} from "react";

import {
    Button,
    Callout,
    Icon,
    type IconType,
    Pill,
    Popover,
    usePopoverState,
} from "@uva-fnwi/datanose-ui";

import {
    applyYamlToNode,
    changeQuestionKind,
    type ConfigDocs,
    countFieldUsages,
    deleteProperty,
    type EditorQuestion,
    findProperty,
    nodeToYaml,
    overrideProperty,
    parseTypeString,
    removeField,
    yamlOnlyReason,
} from "~/components/FormEditor/model";
import {definitionFolderOf} from "~/components/FormEditor/model";
import {NodeYamlEditor} from "~/components/FormEditor/NodeYamlEditor";
import {QuestionConfig} from "~/components/FormEditor/QuestionConfig";
import {QuestionKindMenu} from "~/components/FormEditor/QuestionKindMenu";
import {QuestionPreview} from "~/components/FormEditor/QuestionPreview";
import {useTranslate} from "~/hooks/useTranslate";

type Props = {
    docs: ConfigDocs;
    formPath: string;
    pageName: string;
    question: EditorQuestion;
    apply: (action: () => string[]) => void;
    dragHandle?: ReactNode;
};

function MenuItem({
    icon,
    onClick,
    children,
    isDestructive,
}: {
    icon: IconType;
    onClick: () => void;
    children: ReactNode;
    isDestructive?: boolean;
}) {
    return (
        <button
            type="button"
            onClick={onClick}
            className={`flex w-full items-center gap-2 rounded-xs px-2 py-1.5 text-left text-sm hover:bg-grey-100 focus-visible:ring-2 focus-visible:ring-navy-600 focus-visible:outline-none dark:hover:bg-grey-700 ${
                isDestructive ? "text-red-700 dark:text-red-400" : ""
            }`}
        >
            <Icon name={icon} size="sm" color="current" decorative />
            {children}
        </button>
    );
}

export function QuestionCard({docs, formPath, pageName, question, apply, dragHandle}: Props) {
    const {t, l} = useTranslate("workflow");
    const [isExpanded, setIsExpanded] = useState(false);
    const [isYamlMode, setIsYamlMode] = useState(false);
    const menu = usePopoverState();
    const menuTriggerRef = useRef<HTMLButtonElement>(null);
    const kindMenu = usePopoverState();
    const kindTriggerRef = useRef<HTMLButtonElement>(null);

    /**
     * Located once, not on every render. The yaml editor writes into this exact node, and a keystroke
     * that transiently leaves `name:` half-typed would otherwise make a by-name lookup fail and
     * silently orphan the editor mid-edit. The node object is stable because edits mutate it in place;
     * only an override swaps it for a fresh copy, which re-locates explicitly below.
     */
    const [node, setNode] = useState(() =>
        findProperty(docs, definitionFolderOf(formPath), question.name),
    );
    const relocate = () => setNode(findProperty(docs, definitionFolderOf(formPath), question.name));

    const forcedReason = yamlOnlyReason(question);
    const isMissing = node === null;
    const isYaml = isYamlMode || forcedReason !== null;
    const isInherited = question.isInherited;
    const usages = isMissing ? [] : countFieldUsages(docs, formPath, question.name);

    /**
     * Rewriting type, layout and values under a condition or validation is how one silently breaks,
     * so the pill only changes the kind for questions the visual editor owns outright.
     */
    const canChangeKind = forcedReason === null && !isInherited;
    const kindLabel =
        question.kind === "Unknown"
            ? parseTypeString(question.rawType).underlying || t("form_editor.kind.Missing")
            : t(`form_editor.kind.${question.kind}`);

    const closeMenu = () => menu.close();
    const runAndClose = (action: () => string[]) => {
        closeMenu();
        apply(action);
    };
    const override = () => {
        apply(() => overrideProperty(docs, formPath, question.name));
        relocate();
    };

    return (
        <div className="rounded-xs border border-grey-300 bg-white dark:border-grey-600 dark:bg-grey-900">
            <div className="flex items-center gap-2 p-2">
                <div className="text-grey-500">{dragHandle}</div>
                <button
                    type="button"
                    onClick={() => setIsExpanded((previous) => !previous)}
                    aria-expanded={isExpanded}
                    className="flex min-w-0 items-center gap-2 rounded-xs px-1 py-1 text-left focus-visible:ring-2 focus-visible:ring-navy-600 focus-visible:outline-none"
                >
                    <Icon
                        name={isExpanded ? "chevron-down-line" : "chevron-right-line"}
                        size="sm"
                        decorative
                    />
                    <span className="truncate font-medium">
                        {l(question.text) || question.name}
                        {question.isRequired && <span aria-hidden="true"> *</span>}
                    </span>
                </button>

                {canChangeKind ? (
                    <button
                        ref={kindTriggerRef}
                        type="button"
                        aria-label={t("form_editor.change_type", {type: kindLabel})}
                        aria-expanded={kindMenu.isOpen}
                        aria-haspopup="dialog"
                        onClick={kindMenu.toggle}
                        className="rounded-full focus-visible:ring-2 focus-visible:ring-navy-600 focus-visible:outline-none"
                    >
                        <Pill variant="grey" className="gap-1">
                            <Icon name="square-edit-line" size="xs" color="current" decorative />
                            {kindLabel}
                        </Pill>
                    </button>
                ) : (
                    <Pill variant={isMissing ? "red" : "grey"}>{kindLabel}</Pill>
                )}
                {kindMenu.isOpen && (
                    <QuestionKindMenu
                        label={t("form_editor.change_type", {type: kindLabel})}
                        state={kindMenu}
                        triggerRef={kindTriggerRef as React.RefObject<HTMLElement>}
                        selectedKind={question.kind}
                        onSelect={(kind) =>
                            apply(() => changeQuestionKind(docs, formPath, question.name, kind))
                        }
                    />
                )}

                {forcedReason !== null && !isMissing && (
                    <Pill variant="grey" className="gap-1">
                        <Icon name="code-brackets-line" size="xs" color="current" decorative />
                        {t("form_editor.yaml_only_short")}
                    </Pill>
                )}
                {isInherited && (
                    <Pill variant="grey" className="gap-1">
                        <Icon name="lock-line" size="xs" color="current" decorative />
                        {t("form_editor.inherited_short")}
                    </Pill>
                )}

                <Button
                    className="ml-auto"
                    ref={menuTriggerRef}
                    intent="ghost"
                    size="square"
                    aria-label={t("form_editor.options")}
                    aria-expanded={menu.isOpen}
                    aria-haspopup="dialog"
                    onClick={menu.toggle}
                >
                    <Icon name="dots-single-line" decorative />
                </Button>
                {menu.isOpen && (
                    <Popover
                        state={menu}
                        triggerRef={menuTriggerRef as React.RefObject<HTMLElement>}
                        placement="bottom end"
                        className="border border-grey-400 bg-white shadow-md outline-none dark:bg-grey-800"
                    >
                        <dialog
                            open
                            aria-label={t("form_editor.options")}
                            className="relative m-0 flex w-64 flex-col p-1"
                        >
                            {forcedReason === null && (
                                <MenuItem
                                    icon={isYamlMode ? "square-edit-line" : "code-brackets-line"}
                                    onClick={() => {
                                        setIsYamlMode((previous) => !previous);
                                        setIsExpanded(true);
                                        closeMenu();
                                    }}
                                >
                                    {isYamlMode
                                        ? t("form_editor.edit_visually")
                                        : t("form_editor.edit_in_yaml")}
                                </MenuItem>
                            )}
                            {isInherited && !isMissing && (
                                <MenuItem
                                    icon="unlock-line"
                                    onClick={() => {
                                        closeMenu();
                                        override();
                                    }}
                                >
                                    {t("form_editor.override_here")}
                                </MenuItem>
                            )}
                            <MenuItem
                                icon="minus-line"
                                onClick={() =>
                                    runAndClose(() =>
                                        removeField(docs, formPath, pageName, question.name),
                                    )
                                }
                            >
                                {t("form_editor.remove_from_page")}
                            </MenuItem>
                            {!isMissing && !isInherited && (
                                <MenuItem
                                    icon="trash-line"
                                    isDestructive
                                    onClick={() =>
                                        runAndClose(() =>
                                            deleteProperty(docs, formPath, question.name),
                                        )
                                    }
                                >
                                    {t("form_editor.delete_everywhere", {count: usages.length})}
                                </MenuItem>
                            )}
                        </dialog>
                    </Popover>
                )}
            </div>

            {isExpanded && (
                <div className="grid gap-4 border-t border-grey-200 p-3 lg:grid-cols-[3fr_2fr] dark:border-grey-700">
                    <div className="min-w-0">
                        {forcedReason !== null && (
                            <Callout type={isMissing ? "error" : "info"} className="mb-3">
                                {t(`form_editor.yaml_only.${forcedReason}`, {
                                    keys: question.advancedKeys.join(", "),
                                    type: parseTypeString(question.rawType).underlying,
                                    file: question.definedIn,
                                })}
                            </Callout>
                        )}
                        {isInherited && !isMissing && (
                            <Callout type="info" className="mb-3">
                                <div className="flex flex-wrap items-center gap-3">
                                    <span>
                                        {t("form_editor.inherited_hint", {
                                            file: question.definedIn,
                                        })}
                                    </span>
                                    <Button
                                        intent="secondary"
                                        size="small"
                                        leftIcon={
                                            <Icon
                                                name="unlock-line"
                                                size="sm"
                                                color="current"
                                                decorative
                                            />
                                        }
                                        onClick={override}
                                    >
                                        {t("form_editor.override_here")}
                                    </Button>
                                </div>
                            </Callout>
                        )}

                        {isMissing ? (
                            <p className="text-sm text-grey-600">
                                {t("form_editor.missing_hint", {name: question.name})}
                            </p>
                        ) : isYaml ? (
                            <>
                                <p className="mb-2 text-xs text-grey-600">
                                    {t("form_editor.editing_file", {file: question.definedIn})}
                                </p>
                                <NodeYamlEditor
                                    initialText={node ? nodeToYaml(node.node) : ""}
                                    isReadOnly={isInherited}
                                    schema={{
                                        name: "WorkflowDefinition",
                                        pointer: "#/definitions/PropertyDefinition",
                                    }}
                                    onChange={(text) => {
                                        if (!node) {
                                            return null;
                                        }
                                        // applyYamlToNode has already mutated the shared Document;
                                        // apply only records which file changed and re-renders, which
                                        // is what makes the preview beside this track every keystroke.
                                        const error = applyYamlToNode(node.node, text);
                                        if (error === null) {
                                            apply(() => [node.path]);
                                        }
                                        return error;
                                    }}
                                />
                            </>
                        ) : (
                            <QuestionConfig
                                docs={docs}
                                formPath={formPath}
                                question={question}
                                isDisabled={isInherited}
                                apply={apply}
                            />
                        )}
                    </div>
                    <div className="lg:sticky lg:top-4 lg:self-start">
                        <QuestionPreview docs={docs} question={question} />
                    </div>
                </div>
            )}
        </div>
    );
}
