import {useState} from "react";

import {Button, Callout, Input, Modal, TagInput} from "@uva-fnwi/datanose-ui";

import {useTranslate} from "~/hooks/useTranslate";
import {useCreatePropertyRenameMutation} from "~/store/api/migrationsApi";
import type {CreatePropertyRename} from "~/store/api/types/migrations";
import type {WorkflowDefinition} from "~/store/api/types/workflowDefinitions";

type CreateMigrationModalProps = {
    isOpen: boolean;
    workflowDefinitions: WorkflowDefinition[];
    onClose: () => void;
    onCreated: () => Promise<void>;
};

export function CreateMigrationModal({
    isOpen,
    workflowDefinitions,
    onClose,
    onCreated,
}: CreateMigrationModalProps) {
    const {t} = useTranslate("workflow");
    const [createMigration, {isLoading}] = useCreatePropertyRenameMutation();
    const [form, setForm] = useState<CreatePropertyRename>({
        workflowDefinitions: [],
        oldProperty: "",
        newProperty: "",
    });
    const [error, setError] = useState<string | null>(null);
    const workflowOptions = workflowDefinitions.map((definition) => definition.name);

    const update = (field: "oldProperty" | "newProperty", value: string) =>
        setForm((current) => ({...current, [field]: value}));

    const close = () => {
        if (isLoading) return;
        setError(null);
        onClose();
    };

    const create = async () => {
        setError(null);
        try {
            await createMigration({
                workflowDefinitions: form.workflowDefinitions,
                oldProperty: form.oldProperty.trim(),
                newProperty: form.newProperty.trim(),
            }).unwrap();
            setForm({
                workflowDefinitions: [],
                oldProperty: "",
                newProperty: "",
            });
            await onCreated();
        } catch (requestError) {
            setError(apiErrorMessage(requestError, t("migrations.create_error")));
        }
    };

    const isComplete =
        form.workflowDefinitions.length > 0 &&
        form.oldProperty.trim() !== "" &&
        form.newProperty.trim() !== "";

    return (
        <Modal isOpen={isOpen} onOpenChange={(open) => !open && close()}>
            <Modal.Header>{t("migrations.create_title")}</Modal.Header>
            <Modal.Body className="flex flex-col gap-4">
                <TagInput
                    label={t("migrations.fields.workflow")}
                    placeholder={t("make_a_choice")}
                    data={workflowOptions}
                    value={form.workflowDefinitions}
                    onChange={(values) =>
                        setForm((current) => ({
                            ...current,
                            workflowDefinitions: values.filter((value) =>
                                workflowOptions.includes(value),
                            ),
                        }))
                    }
                    acceptValueOnBlur={false}
                    openOnFocus
                    clearable
                />
                <Input
                    label={t("migrations.fields.old_property")}
                    value={form.oldProperty}
                    onChange={(value) => update("oldProperty", value)}
                />
                <Input
                    label={t("migrations.fields.new_property")}
                    value={form.newProperty}
                    onChange={(value) => update("newProperty", value)}
                />
                {error && <Callout type="error">{error}</Callout>}
            </Modal.Body>
            <Modal.Footer>
                <Button
                    intent="primary"
                    disabled={!isComplete}
                    isLoading={isLoading}
                    onClick={() => void create()}
                >
                    {t("migrations.create")}
                </Button>
                <Button intent="secondary" onClick={close} disabled={isLoading}>
                    {t("cancel")}
                </Button>
            </Modal.Footer>
        </Modal>
    );
}

function apiErrorMessage(error: unknown, fallback: string) {
    if (!error || typeof error !== "object" || !("data" in error)) return fallback;
    const data = error.data;
    if (typeof data === "string") return data;
    if (data && typeof data === "object" && "message" in data && typeof data.message === "string") {
        return data.message;
    }
    return fallback;
}
