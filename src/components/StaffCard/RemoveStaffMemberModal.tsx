import {Button, Modal} from "@uva-fnwi/datanose-ui";

import {useTranslate} from "~/hooks/useTranslate.ts";
import type {UserSearchResult} from "~/store/api/types/users.ts";

export type RemoveStaffMemberModalProps = {
    isOpen: boolean;
    setIsOpen: (isOpen: boolean) => void;
    onConfirm: () => void;
    user: UserSearchResult;
    isSaving?: boolean;
};

export function RemoveStaffMemberModal({
    isOpen,
    setIsOpen,
    onConfirm,
    user,
}: RemoveStaffMemberModalProps) {
    const {t} = useTranslate("workflow");

    return (
        <Modal isOpen={isOpen} onOpenChange={setIsOpen}>
            <Modal.Header>
                {t("staff_card.remove_staff_title", {name: user.displayName})}
            </Modal.Header>
            <Modal.Body>
                {t("staff_card.remove_staff_confirmation", {name: user.displayName})}
            </Modal.Body>
            <Modal.Footer>
                <Button intent="secondary" variant="destructive" onClick={() => setIsOpen(false)}>
                    {t("cancel")}
                </Button>
                <Button intent="primary" variant="destructive" onClick={onConfirm}>
                    {t("confirm")}
                </Button>
            </Modal.Footer>
        </Modal>
    );
}
