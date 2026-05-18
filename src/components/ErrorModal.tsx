import {Modal} from "@uva-fnwi/datanose-ui";

import {useTranslate} from "~/hooks/useTranslate.ts";
import {closeErrorModal, selectErrorModal} from "~/store/ErrorModalSlice.ts";
import {useAppDispatch, useAppSelector} from "~/store/store.ts";

export const ErrorModal = () => {
    const {t} = useTranslate("common");
    const dispatch = useAppDispatch();
    const {open} = useAppSelector(selectErrorModal);

    return (
        <Modal
            isOpen={open}
            onOpenChange={(isOpen) => {
                if (!isOpen) dispatch(closeErrorModal());
            }}
            role="alertdialog"
            size="sm"
        >
            <Modal.Header>{t("error_modal.title")}</Modal.Header>
            <Modal.Body>{t("error_modal.message")}</Modal.Body>
            <Modal.Footer />
        </Modal>
    );
};
