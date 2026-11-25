import {useState} from "react";

import {Button, Modal, Radio, RadioGroup} from "@uva-fnwi/datanose-ui";
import {type Document, isMap} from "yaml";

import {BilingualPair} from "~/components/FormEditor/BilingualPair";
import {type ApplyFormEdit, readFormTitle} from "~/components/FormEditor/model";
import {useTranslate} from "~/hooks/useTranslate";
import type {FormLayout} from "~/store/api/types/submissions";
import type {DraftFormReference, DraftStepReference} from "~/store/api/workflowDraftsApi";

const layouts: FormLayout[] = ["Normal", "Compact", "Modal"];

function stepTitles(steps: DraftStepReference[]): [string, DraftStepReference["title"]][] {
    return steps.flatMap(({name, title, children}) => [[name, title], ...stepTitles(children)]);
}

export function DraftFormSettings({
    document,
    form,
    steps,
    apply,
    onClose,
    disabled,
}: {
    document: Document;
    form: DraftFormReference;
    steps: DraftStepReference[];
    apply: ApplyFormEdit;
    onClose: () => void;
    disabled: boolean;
}) {
    const {t, l} = useTranslate("form_editor");
    const [initialTitle] = useState(() => readFormTitle(document) ?? form.title);
    const [initialLayout] = useState(() => {
        const raw = document.get("layout");
        return (
            layouts.find(
                (item) => typeof raw === "string" && item.toLowerCase() === raw.toLowerCase(),
            ) ??
            form.layout ??
            "Normal"
        );
    });
    const [title, setTitle] = useState(initialTitle);
    const [layout, setLayout] = useState(initialLayout);
    const titleChanged = title.en !== initialTitle.en || title.nl !== initialTitle.nl;
    const layoutChanged = layout !== initialLayout;
    const invalidTitle = titleChanged && !title.en.trim() && !title.nl.trim();
    const titles = new Map(stepTitles(steps));
    const usages = form.steps.map(({name}) => l(titles.get(name)) || name);

    const applySettings = async () => {
        await apply(() => {
            if (titleChanged) {
                const current = document.get("title");
                if (isMap(current)) {
                    if (title.en !== initialTitle.en) current.set("en", title.en);
                    if (title.nl !== initialTitle.nl) current.set("nl", title.nl);
                } else {
                    document.set("title", title);
                }
            }
            if (layoutChanged) document.set("layout", layout);
            return [form.path];
        });
        onClose();
    };

    return (
        <Modal
            isOpen
            aria-label={t("authoring_form_settings")}
            size="sm"
            onOpenChange={(open) => !open && onClose()}
        >
            <Modal.Header>{t("authoring_form_settings")}</Modal.Header>
            <Modal.Body className="space-y-4">
                <BilingualPair
                    label={t("authoring_form_title")}
                    value={title}
                    isDisabled={disabled}
                    onChange={(language, value) =>
                        setTitle((previous) => ({...previous, [language]: value}))
                    }
                />
                {invalidTitle && (
                    <p className="text-sm text-red-700 dark:text-red-300">
                        {t("authoring_form_title_required")}
                    </p>
                )}
                <RadioGroup
                    label={t("authoring_form_layout")}
                    orientation="horizontal"
                    value={layout}
                    isDisabled={disabled}
                    onChange={(value) => {
                        const next = layouts.find((item) => item === value);
                        if (next) setLayout(next);
                    }}
                >
                    {layouts.map((item) => (
                        <Radio key={item} value={item}>
                            {t(`authoring_form_layouts.${item}`)}
                        </Radio>
                    ))}
                </RadioGroup>
                {usages.length > 0 && (
                    <p className="text-sm text-grey-700 dark:text-grey-300">
                        {t("authoring_form_used_in", {steps: usages.join(", ")})}
                    </p>
                )}
            </Modal.Body>
            <Modal.Footer>
                <Button intent="secondary" onClick={onClose}>
                    {t("cancel", {ns: "common"})}
                </Button>
                <Button
                    intent="primary"
                    disabled={disabled || invalidTitle || (!titleChanged && !layoutChanged)}
                    onClick={() => void applySettings()}
                >
                    {t("authoring_apply_form_settings")}
                </Button>
            </Modal.Footer>
        </Modal>
    );
}
