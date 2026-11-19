import {useCallback, useEffect, useId, useRef, useState} from "react";

import {
    Button,
    Heading,
    Icon,
    LoadingSpinner,
    Modal,
    Select,
    SelectItem,
    Separator,
    Tab,
    TabList,
    TabPanel,
    TabPanels,
    Tabs,
    Text,
} from "@uva-fnwi/datanose-ui";

import {FileUploadTable} from "./FileUploadTable";
import {PageElement} from "./PageElement";
import {useDebounce} from "~/hooks/useDebounce";
import {usePageForm} from "~/hooks/usePageForm";
import {useTranslate} from "~/hooks/useTranslate";
import {formPreviewsApi} from "~/store/api/formPreviewsApi";
import type {FormPreview, PreviewableForm} from "~/store/api/types/formPreviews";
import type {AnswerInput} from "~/store/api/types/params";
import {isWeightedQuestion} from "~/utils/submissionUtils";

type Props = {instanceId: string; forms: PreviewableForm[]; onClose: () => void};

export function FormPreviewModal({instanceId, forms, onClose}: Props) {
    const {t, l} = useTranslate("workflow");
    const [selected, setSelected] = useState(forms.length === 1 ? forms[0].name : null);
    const [session, setSession] = useState(0);
    const switchNoticeId = useId();
    const form = forms.find((form) => form.name === selected);
    const title = t("form_preview.title", {count: forms.length, form: l(form?.title)});
    const headerClass =
        "sticky top-0 z-10 shrink-0 border-b border-grey-200 bg-white dark:bg-grey-900";

    if (!form) {
        return (
            <Modal isOpen onOpenChange={onClose} size="md" aria-label={title}>
                <div className={headerClass}>
                    <Modal.Header description={t("form_preview.choose_form")}>{title}</Modal.Header>
                </div>
                <Modal.Body className="pb-6">
                    <ul className="divide-y divide-grey-200 dark:divide-grey-700">
                        {forms.map((form) => (
                            <li key={form.name}>
                                <Button
                                    intent="ghost"
                                    width="full"
                                    justify="between"
                                    className="h-auto min-h-12 rounded-none py-3 whitespace-normal"
                                    rightIcon={
                                        <Icon name="arrow-right-line" size="sm" decorative />
                                    }
                                    onClick={() => setSelected(form.name)}
                                >
                                    <span className="text-left">{l(form.title)}</span>
                                </Button>
                            </li>
                        ))}
                    </ul>
                </Modal.Body>
            </Modal>
        );
    }

    return (
        <Modal isOpen onOpenChange={onClose} size="xl" aria-label={title}>
            <div className={headerClass}>
                <Modal.Header description={t("form_preview.temporary_notice")}>
                    {title}
                </Modal.Header>
                {forms.length > 1 && (
                    <div className="grid gap-1 px-6 pt-2 pb-4">
                        <Select
                            aria-label={t("form_preview.form")}
                            aria-describedby={switchNoticeId}
                            value={form.name}
                            onChange={(value) => setSelected(String(value))}
                        >
                            {forms.map((form) => (
                                <SelectItem key={form.name}>{l(form.title)}</SelectItem>
                            ))}
                        </Select>
                        <Text
                            id={switchNoticeId}
                            as="p"
                            display="block"
                            size="sm"
                            intent="secondary"
                        >
                            {t("form_preview.switch_notice")}
                        </Text>
                    </div>
                )}
            </div>
            <PreviewSession
                key={`${instanceId}/${form.name}/${session}`}
                instanceId={instanceId}
                formName={form.name}
                onReset={() => setSession((current) => current + 1)}
            />
        </Modal>
    );
}

function PreviewSession({
    instanceId,
    formName,
    onReset,
}: {
    instanceId: string;
    formName: string;
    onReset: () => void;
}) {
    const {t, l, i18n} = useTranslate("workflow");
    const [evaluate] = formPreviewsApi.useEvaluateFormPreviewMutation();
    const [preview, setPreview] = useState<FormPreview>();
    const [status, setStatus] = useState<"evaluating" | "done" | "failed" | "retrying">(
        "evaluating",
    );
    const showError = status === "failed" || status === "retrying";
    const [pageName, setPageName] = useState<string>();
    const values = useRef<Record<string, unknown>>({});
    const revision = useRef(0);
    const pending = useRef<ReturnType<typeof evaluate> | null>(null);
    const form = usePageForm(preview?.answers ?? []);

    const runEvaluation = useCallback(() => {
        const currentRevision = revision.current;
        pending.current?.abort();
        const request = evaluate({instanceId, formName, answers: {...values.current}});
        pending.current = request;
        const isCurrentRequest = () =>
            pending.current === request && currentRevision === revision.current;
        void request
            .unwrap()
            .then((data) => {
                if (!isCurrentRequest()) return;
                const inputNames = new Set(
                    data.form.pages.flatMap((page) =>
                        page.elements.flatMap((element) =>
                            element.question && element.question.type !== "File"
                                ? [element.question.name]
                                : [],
                        ),
                    ),
                );
                for (const answer of data.answers) {
                    if (
                        answer.isVisible &&
                        answer.value != null &&
                        inputNames.has(answer.questionName) &&
                        !(answer.questionName in values.current)
                    ) {
                        values.current[answer.questionName] = answer.value;
                    }
                }
                setPreview(data);
                setStatus("done");
            })
            .catch(() => {
                if (isCurrentRequest()) setStatus("failed");
            });
    }, [evaluate, instanceId, formName]);
    const scheduleEvaluation = useDebounce(runEvaluation, 300);

    useEffect(() => {
        runEvaluation();
        return () => {
            const request = pending.current;
            pending.current = null;
            request?.abort();
            request?.reset();
        };
    }, [runEvaluation]);

    const change = ({questionName, value}: AnswerInput) => {
        values.current[questionName] = value;
        revision.current++;
        setStatus(showError ? "retrying" : "evaluating");
        scheduleEvaluation();
    };
    const pages = preview?.form.pages.filter((page) => page.isInCurrentForm) ?? [];
    const activeTabs = pages.flatMap((page, index) => (page.isActive ? [index] : []));
    const activePosition = Math.max(
        0,
        activeTabs.findIndex((index) => pages[index].name === pageName),
    );
    const activeIndex = activeTabs[activePosition] ?? -1;
    const previousPage = pages[activeTabs[activePosition - 1]];
    const nextPage = pages[activeTabs[activePosition + 1]];

    const renderBody = () => {
        if (!preview) return !showError && <LoadingSpinner />;
        if (pages.length === 0) return <Text>{t("form_preview.no_active_pages")}</Text>;

        return (
            <>
                <Tabs
                    activeIndex={activeIndex}
                    onTabChange={(index) => setPageName(pages[index].name)}
                >
                    <TabList
                        className={pages.length === 1 && activeIndex !== -1 ? "hidden" : undefined}
                    >
                        {pages.map((page) => (
                            <Tab key={page.name} disabled={!page.isActive}>
                                <span className={page.isActive ? undefined : "line-through"}>
                                    {l(page.title)}
                                </span>
                            </Tab>
                        ))}
                    </TabList>
                    <TabPanels>
                        {pages.map((page) => {
                            const weighted = page.elements.filter(
                                (element) =>
                                    element.question && isWeightedQuestion(element.question),
                            );
                            const fileQuestions = page.elements.flatMap(({question}) =>
                                question?.type === "File" &&
                                preview.answers.some(
                                    (answer) =>
                                        answer.questionName === question.name && answer.isVisible,
                                )
                                    ? [question]
                                    : [],
                            );
                            const result = preview.pageResults.find(
                                (result) => result.name === page.name,
                            );
                            return (
                                <TabPanel key={page.name}>
                                    <div className="my-4 flex flex-col gap-6">
                                        {pages.length === 1 && (
                                            <Heading size="sm">{l(page.title)}</Heading>
                                        )}
                                        {page.elements.map((element, index) => (
                                            <PageElement
                                                key={element.question?.name ?? index}
                                                instanceId={instanceId}
                                                submissionId={formName}
                                                element={element}
                                                answer={preview.answers.find(
                                                    (answer) =>
                                                        answer.questionName ===
                                                        element.question?.name,
                                                )}
                                                formControl={form.control}
                                                preview
                                                onChange={change}
                                                showCompact={
                                                    preview.form.layout === "Compact" &&
                                                    element.question?.type === "Choice"
                                                }
                                                showPercentages={weighted.length > 1}
                                                choices={
                                                    element.question?.type === "Reference"
                                                        ? (preview.referenceChoices[
                                                              element.question.name
                                                          ] ?? [])
                                                        : undefined
                                                }
                                            />
                                        ))}
                                        {fileQuestions.length > 0 && (
                                            <FileUploadTable questions={fileQuestions} />
                                        )}
                                        {!showError && result && result.questionCount > 0 && (
                                            <div role="status" className="my-4">
                                                <Separator
                                                    weight="bold"
                                                    color="black"
                                                    className="mb-4"
                                                />
                                                {status === "evaluating" ? (
                                                    <Text>{t("form_preview.updating")}</Text>
                                                ) : (
                                                    <div className="flex flex-col gap-1">
                                                        <Text
                                                            as="p"
                                                            display="block"
                                                            size="sm"
                                                            intent="secondary"
                                                        >
                                                            {t(
                                                                "form_preview.calculation_progress",
                                                                {
                                                                    answered: result.answeredCount,
                                                                    total: result.questionCount,
                                                                },
                                                            )}
                                                        </Text>
                                                        {result.weightedAverage == null ? (
                                                            <Text as="p" display="block">
                                                                {t(
                                                                    "form_preview.complete_calculation",
                                                                )}
                                                            </Text>
                                                        ) : (
                                                            <Text
                                                                as="p"
                                                                display="block"
                                                                size="xl"
                                                                fontWeight="semibold"
                                                            >
                                                                {t("form_preview.average", {
                                                                    value: result.weightedAverage.toLocaleString(
                                                                        i18n.language,
                                                                    ),
                                                                })}
                                                            </Text>
                                                        )}
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                </TabPanel>
                            );
                        })}
                    </TabPanels>
                </Tabs>
                {activeIndex === -1 && <Text>{t("form_preview.no_active_pages")}</Text>}
            </>
        );
    };

    return (
        <>
            <Modal.Body>
                {showError && (
                    <Text role="alert" intent="error">
                        {t(preview ? "form_preview.update_failed" : "form_load_failed")}
                    </Text>
                )}
                {renderBody()}
            </Modal.Body>
            <Modal.Footer className="sticky bottom-0 z-10 flex-wrap items-center gap-3 border-t border-grey-200 bg-white dark:bg-grey-900">
                <Button intent="secondary" onClick={onReset}>
                    {t("form_preview.reset")}
                </Button>
                <div className="ml-auto flex flex-wrap justify-end gap-3">
                    {showError && (
                        <Button
                            intent="secondary"
                            isLoading={status === "retrying"}
                            onClick={() => {
                                setStatus("retrying");
                                runEvaluation();
                            }}
                        >
                            {t("retry")}
                        </Button>
                    )}
                    {pages.length > 1 && (
                        <>
                            <Button
                                intent="secondary"
                                disabled={!previousPage}
                                onClick={() => setPageName(previousPage?.name)}
                            >
                                {t("previous")}
                            </Button>
                            <Button
                                intent="primary"
                                disabled={!nextPage}
                                onClick={() => setPageName(nextPage?.name)}
                            >
                                {t("next")}
                            </Button>
                        </>
                    )}
                </div>
            </Modal.Footer>
        </>
    );
}
