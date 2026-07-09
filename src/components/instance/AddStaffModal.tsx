import {useState} from "react";

import {Button, Callout, InputLabel, Modal, Select, SelectItem, Text} from "@uva-fnwi/datanose-ui";

import {UserPickerInput} from "~/components/UserPicker/UserPickerInput.tsx";
import {type LocalString, useTranslate} from "~/hooks/useTranslate.ts";
import type {WorkflowInstanceField} from "~/store/api/types/instances.ts";
import type {UserSearchResult} from "~/store/api/types/users.ts";
import {getStringField} from "~/utils/fieldUtils.ts";

export interface AddStaffModalProps {
    isOpen: boolean;
    onOpenChange: (isOpen: boolean) => void;
    //onConfirm: (newUser: string) => Promise<void>;
    onConfirm: (newUser: string) => void;
    isSaving?: boolean;
    instanceFields?: WorkflowInstanceField[];
}

type Role = {
    name: string;
    title: LocalString;
};

export default function AddStaffModal({
    isOpen,
    onOpenChange,
    onConfirm,
    isSaving,
    instanceFields,
}: AddStaffModalProps) {
    const {l, t} = useTranslate("workflow");
    const [selectedRole, setSelectedRole] = useState<Role | null>(null);
    const [selectedUsers, setSelectedUsers] = useState<UserSearchResult[]>([]);

    const studentName =
        getStringField(instanceFields, "Student.DisplayName") ??
        t("staff_card.add_modal.this_student");

    const staffRoles = [
        {name: "Rol 1", title: {en: "Role 1", nl: "Rol 1"}},
        {name: "Rol 2", title: {en: "Role 2", nl: "Rol 2"}},
    ];

    const isComplete = selectedRole != null && selectedUsers.length > 0;
    const handleConfirm = () => {
        console.log(
            "selected role: ",
            selectedRole?.name,
            "selected users: ",
            selectedUsers.map((u) => u.displayName).join(","),
        );
        onConfirm(selectedRole?.name ?? "");
        onOpenChange(false);
    };

    const handleCancel = () => {
        onOpenChange(false);
    };

    return (
        <Modal isOpen={isOpen} onOpenChange={onOpenChange}>
            <Modal.Header>{t("staff_card.add_modal.title")}</Modal.Header>
            <Modal.Body className="flex flex-col gap-4">
                <Text>{t("staff_card.add_modal.description", {studentName})}</Text>

                <div>
                    <InputLabel>{t("staff_card.add_modal.choose_role")}</InputLabel>
                    <Select
                        placeholder={t("make_a_choice")}
                        value={l(selectedRole?.title)}
                        onChange={(value) =>
                            setSelectedRole(staffRoles?.find((role) => role.name === value) ?? null)
                        }
                    >
                        {staffRoles?.map((role) => (
                            <SelectItem key={role.name} title={l(role.title)}>
                                {l(role.title)}
                            </SelectItem>
                        )) ?? []}
                    </Select>
                </div>
                <div>
                    <InputLabel>{t("staff_card.add_modal.choose_staff")}</InputLabel>
                    <UserPickerInput
                        onSelectionChange={setSelectedUsers}
                        searchPlaceholder={t("make_a_choice")}
                        autoFocus={false}
                        allowsExternalUsers={true}
                    />
                </div>
                <Callout header={t("staff_card.add_modal.callout_header")}>
                    {t("staff_card.add_modal.callout_text")}
                </Callout>
            </Modal.Body>
            <Modal.Footer>
                <div className="flex flex-row gap-2">
                    <Button
                        size="large"
                        intent="primary"
                        variant="destructive"
                        onClick={handleConfirm}
                        disabled={!isComplete}
                        isLoading={isSaving}
                    >
                        {t("confirm")}
                    </Button>
                    <Button
                        size="large"
                        intent="secondary"
                        variant="destructive"
                        onClick={handleCancel}
                        className="ml-auto"
                    >
                        {t("cancel")}
                    </Button>
                </div>
            </Modal.Footer>
        </Modal>
    );
}
