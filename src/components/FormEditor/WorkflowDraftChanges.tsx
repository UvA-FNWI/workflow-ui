import {useState} from "react";

import {Button, Callout, Heading, LoadingSpinner, Modal} from "@uva-fnwi/datanose-ui";

import {FormModal} from "~/components/instance/FormModal";
import {type LocalString, useTranslate} from "~/hooks/useTranslate";
import type {Form, Page} from "~/store/api/types/submissions";
import {
    authoringErrorMessage,
    type DraftHead,
    useGetDraftFormChangesQuery,
} from "~/store/api/workflowDraftsApi";

const differs = (before: unknown, after: unknown) =>
    JSON.stringify(before) !== JSON.stringify(after);

function questions(page: Page) {
    return new Map(
        page.elements.flatMap(({question}) =>
            question ? [[question.name, question] as const] : [],
        ),
    );
}

function summarizeForm(
    before: Form,
    after: Form,
    t: (key: string, values?: Record<string, string>) => string,
    label: (title: LocalString, fallback: string) => string,
) {
    const changes: string[] = [];
    const add = (key: string, values?: Record<string, string>) => changes.push(t(key, values));
    if (differs(before.title, after.title)) {
        add("authoring_change_title", {
            before: label(before.title, before.name),
            after: label(after.title, after.name),
        });
    }
    if (before.layout !== after.layout) {
        add("authoring_change_layout", {
            before: t(`authoring_form_layouts.${before.layout}`),
            after: t(`authoring_form_layouts.${after.layout}`),
        });
    }

    const oldPages = new Map(before.pages.filter((p) => p.isInCurrentForm).map((p) => [p.name, p]));
    const newPages = new Map(after.pages.filter((p) => p.isInCurrentForm).map((p) => [p.name, p]));
    if (
        differs(
            [...oldPages.keys()].filter((name) => newPages.has(name)),
            [...newPages.keys()].filter((name) => oldPages.has(name)),
        )
    ) {
        add("authoring_change_tabs_reordered");
    }

    for (const name of new Set([...oldPages.keys(), ...newPages.keys()])) {
        const oldPage = oldPages.get(name);
        const page = newPages.get(name);
        const tab = page ? label(page.title, name) : label(oldPage!.title, name);
        if (!oldPage || !page) {
            add(page ? "authoring_change_tab_added" : "authoring_change_tab_removed", {tab});
            continue;
        }
        if (differs(oldPage.title, page.title)) {
            add("authoring_change_tab_title", {before: label(oldPage.title, name), after: tab});
        }

        const oldQuestions = questions(oldPage);
        const newQuestions = questions(page);
        for (const key of new Set([...oldQuestions.keys(), ...newQuestions.keys()])) {
            const oldQuestion = oldQuestions.get(key);
            const question = newQuestions.get(key);
            const text = question ?? oldQuestion!;
            const field = label(text.text, text.name);

            if (!oldQuestion || !question) {
                add(
                    question
                        ? "authoring_change_question_added"
                        : "authoring_change_question_removed",
                    {tab, field},
                );
                continue;
            }
            if (oldQuestion.isRequired !== question.isRequired) {
                add("authoring_change_required", {
                    tab,
                    field,
                    before: t(
                        oldQuestion.isRequired ? "required" : "authoring_optional",
                    ).toLowerCase(),
                    after: t(question.isRequired ? "required" : "authoring_optional").toLowerCase(),
                });
            }
            if (differs({...oldQuestion, isRequired: false}, {...question, isRequired: false})) {
                add("authoring_change_question_settings", {tab, field});
            }
        }

        const blocks = (p: Page) => p.elements.filter((item) => item.kind !== "Question");
        if (differs(blocks(oldPage), blocks(page))) {
            add("authoring_change_help", {tab});
        }
        const commonElementOrder = (p: Page) =>
            p.elements
                .filter(
                    ({question}) =>
                        !question ||
                        (oldQuestions.has(question.name) && newQuestions.has(question.name)),
                )
                .map(({kind, question}) => question?.name ?? kind);
        const oldOrder = commonElementOrder(oldPage);
        const order = commonElementOrder(page);
        if (differs(oldOrder, order) && !differs(oldOrder.toSorted(), order.toSorted())) {
            add("authoring_change_order", {tab});
        }
    }

    return changes;
}

export function WorkflowDraftChanges({head, onClose}: {head: DraftHead; onClose: () => void}) {
    const {t, l} = useTranslate("form_editor");
    const {currentData, error, isFetching, refetch} = useGetDraftFormChangesQuery(head, {
        refetchOnMountOrArgChange: true,
    });
    const [preview, setPreview] = useState<Form | null>(null);
    const stale = (error as {data?: {error?: string}})?.data?.error === "DraftHeadChanged";
    const label = (title: LocalString, fallback: string) =>
        l(title) || title.en || title.nl || fallback;

    if (preview) return <FormModal previewForm={preview} onClose={() => setPreview(null)} />;

    return (
        <Modal
            isOpen
            onOpenChange={(open) => !open && onClose()}
            size="xl"
            aria-label={t("authoring_review_changes")}
        >
            <Modal.Header>{t("authoring_review_changes")}</Modal.Header>
            <Modal.Body className="space-y-5">
                <p className="text-sm text-grey-700 dark:text-grey-300">
                    {t("authoring_review_scope")}
                </p>
                {isFetching ? (
                    <LoadingSpinner />
                ) : stale ? (
                    <Callout type="info">{t("authoring_error_review_refresh")}</Callout>
                ) : error ? (
                    <div className="space-y-2">
                        <Callout type="error">{authoringErrorMessage(error, t)}</Callout>
                        <Button intent="secondary" onClick={() => void refetch()}>
                            {t("authoring_retry")}
                        </Button>
                    </div>
                ) : currentData?.length ? (
                    <ul className="divide-y divide-grey-300 border-y border-grey-300 dark:divide-grey-700 dark:border-grey-700">
                        {currentData.map(({path, before, after}) => {
                            const form = (after ?? before)!;
                            const changes =
                                before && after ? summarizeForm(before, after, t, label) : [];
                            return (
                                <li key={path} className="space-y-3 py-4">
                                    <div className="flex flex-wrap items-center justify-between gap-x-5 gap-y-2">
                                        <Heading as="h3" size="xs">
                                            {label(form.title, form.name)}
                                        </Heading>
                                        <div className="flex flex-wrap gap-x-2 gap-y-1">
                                            {before && (
                                                <Button
                                                    intent="ghost"
                                                    size="small"
                                                    onClick={() => setPreview(before)}
                                                >
                                                    {t("authoring_preview_original")}
                                                </Button>
                                            )}
                                            {after && (
                                                <Button
                                                    intent="secondary"
                                                    size="small"
                                                    onClick={() => setPreview(after)}
                                                >
                                                    {t("authoring_preview_saved")}
                                                </Button>
                                            )}
                                        </div>
                                    </div>
                                    <ul className="list-disc space-y-1.5 rounded-sm bg-grey-100 py-2.5 pr-3 pl-7 text-sm marker:text-navy-700 dark:bg-grey-800/70 dark:marker:text-sky-300">
                                        {changes.length ? (
                                            changes.map((change, index) => (
                                                <li key={index}>{change}</li>
                                            ))
                                        ) : (
                                            <li>
                                                {t(
                                                    !before
                                                        ? "authoring_change_form_added"
                                                        : !after
                                                          ? "authoring_change_form_removed"
                                                          : "authoring_change_form_settings",
                                                )}
                                            </li>
                                        )}
                                    </ul>
                                </li>
                            );
                        })}
                    </ul>
                ) : (
                    <Callout type="info">{t("authoring_no_visible_form_changes")}</Callout>
                )}
            </Modal.Body>
            <Modal.Footer>
                <Button intent="secondary" onClick={onClose}>
                    {t("close", {ns: "common"})}
                </Button>
            </Modal.Footer>
        </Modal>
    );
}
