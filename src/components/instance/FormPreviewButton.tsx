import {useState} from "react";

import {Button, Icon} from "@uva-fnwi/datanose-ui";

import {FormPreviewModal} from "./FormPreviewModal";
import {useTranslate} from "~/hooks/useTranslate";
import type {PreviewableForm} from "~/store/api/types/formPreviews";

export function FormPreviewButton({
    instanceId,
    forms,
}: {
    instanceId: string;
    forms: PreviewableForm[];
}) {
    const {t} = useTranslate("workflow");
    const [open, setOpen] = useState(false);

    if (forms.length === 0) return null;

    return (
        <>
            <Button
                intent="secondary"
                aria-haspopup="dialog"
                leftIcon={<Icon name="visible-line" size="sm" color="current" decorative />}
                onClick={() => setOpen(true)}
            >
                {t("form_preview.entry_point", {count: forms.length})}
            </Button>
            {open && (
                <FormPreviewModal
                    instanceId={instanceId}
                    forms={forms}
                    onClose={() => setOpen(false)}
                />
            )}
        </>
    );
}
