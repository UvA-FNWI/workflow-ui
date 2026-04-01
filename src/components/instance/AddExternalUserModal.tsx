import {useCallback, useRef} from "react";

import {Button, Input, Modal, Select, Text} from "@datanose/ui";
import {Item} from "@datanose/ui";

import {useTranslate} from "~/hooks/useTranslate.ts";

// type externalUser = {
//     name: string;
//     email: string;
//     institute: string;
// };

const mockInstitutes = [
    "Amsterdam Center for Applied Data Research",
    "European Institute for Cognitive Systems",
    "Netherlands Urban Innovation Lab",
    "Global Institute for Sustainable Technologies",
    "Benelux Cybersecurity Research Alliance",
    "Institute for Advanced Behavioral Analytics",
    "Northern Europe Quantum Computing Consortium",
    "International Center for Marine & Climate Studies",
    "Amsterdam–Rotterdam Bioinformatics Network",
    "Digital Humanities Collaboration Hub",
    "European Robotics & Automation Partnership",
    "Center for Ethical AI and Society",
    "Lowlands Institute for Public Policy Research",
    "Global Health & Epidemiology Exchange",
    "Amsterdam Corporate Innovation Forum",
];

export interface AddExternalUserModalProps {
    isOpen: boolean;
    onOpenChange: (isOpen: boolean) => void;
    onConfirm: (email: string) => void;
}

export const AddExternalUserModal: React.FC<AddExternalUserModalProps> = ({
    isOpen,
    onOpenChange,
    onConfirm,
}) => {
    const {t} = useTranslate("workflow", {keyPrefix: "external_user_add"});
    const confirmButtonRef = useRef<HTMLButtonElement>(null);
    const isCompleted = false;

    const handleConfirm = useCallback(() => {
        onConfirm("");
        onOpenChange(false);
    }, [onConfirm, onOpenChange]);

    const handleCancel = useCallback(() => {
        onOpenChange(false);
    }, [onOpenChange]);

    return (
        <Modal isOpen={isOpen} onOpenChange={onOpenChange}>
            <Modal.Header>{t("title")}</Modal.Header>
            <Modal.Body>
                <Text>{t("description")}</Text>

                <Input title={t("name")} type="text" />
                <Input title={t("email")} type="text" />

                <Select>
                    {mockInstitutes.map((item) => (
                        <Item key={item}>{item}</Item>
                    ))}
                </Select>
            </Modal.Body>
            <Modal.Footer>
                <Button intent="secondary" onClick={handleCancel}>
                    {t("cancel")}
                </Button>
                <Button
                    intent="primary"
                    onClick={handleConfirm}
                    disabled={!isCompleted}
                    ref={confirmButtonRef}
                >
                    {t("confirm")}
                </Button>
            </Modal.Footer>
        </Modal>
    );
};
