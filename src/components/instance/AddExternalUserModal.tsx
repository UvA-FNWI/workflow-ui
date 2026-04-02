import {useCallback, useRef, useState} from "react";

import {Button, Input, Modal, SearchInput, Text} from "@datanose/ui";

import {SearchListBox, type SearchListBoxValue} from "~/components/instance/SearchListBox.tsx";
import {useTranslate} from "~/hooks/useTranslate.ts";
import type {UserSearchResult} from "~/store/api/types/users.ts";

// Selection type from react-stately
type Selection = "all" | Set<string | number>;

const mockInstitutes: SearchListBoxValue[] = [
    {
        key: "amsterdam-center-applied-data-research",
        primaryValue: "Amsterdam Center for Applied Data Research",
    },
    {
        key: "european-institute-cognitive-systems",
        primaryValue: "European Institute for Cognitive Systems",
    },
    {
        key: "netherlands-urban-innovation-lab",
        primaryValue: "Netherlands Urban Innovation Lab",
    },
    {
        key: "global-institute-sustainable-technologies",
        primaryValue: "Global Institute for Sustainable Technologies",
    },
    {
        key: "benelux-cybersecurity-research-alliance",
        primaryValue: "Benelux Cybersecurity Research Alliance",
    },
    {
        key: "institute-advanced-behavioral-analytics",
        primaryValue: "Institute for Advanced Behavioral Analytics",
    },
    {
        key: "northern-europe-quantum-computing-consortium",
        primaryValue: "Northern Europe Quantum Computing Consortium",
    },
    {
        key: "international-center-marine-climate-studies",
        primaryValue: "International Center for Marine & Climate Studies",
    },
    {
        key: "amsterdam-rotterdam-bioinformatics-network",
        primaryValue: "Amsterdam–Rotterdam Bioinformatics Network",
    },
    {
        key: "digital-humanities-collaboration-hub",
        primaryValue: "Digital Humanities Collaboration Hub",
    },
    {
        key: "european-robotics-automation-partnership",
        primaryValue: "European Robotics & Automation Partnership",
    },
    {
        key: "center-ethical-ai-society",
        primaryValue: "Center for Ethical AI and Society",
    },
    {
        key: "lowlands-institute-public-policy-research",
        primaryValue: "Lowlands Institute for Public Policy Research",
    },
    {
        key: "global-health-epidemiology-exchange",
        primaryValue: "Global Health & Epidemiology Exchange",
    },
    {
        key: "amsterdam-corporate-innovation-forum",
        primaryValue: "Amsterdam Corporate Innovation Forum",
    },
];

export interface AddExternalUserModalProps {
    isOpen: boolean;
    onOpenChange: (isOpen: boolean) => void;
    onConfirm: (newUser: UserSearchResult) => void;
}

const emptyExternalUser: UserSearchResult = {
    displayName: "",
    userName: "",
    email: "",
    institute: "",
};

export const AddExternalUserModal: React.FC<AddExternalUserModalProps> = ({
    isOpen,
    onOpenChange,
    onConfirm,
}) => {
    const {t} = useTranslate("workflow");
    const confirmButtonRef = useRef<HTMLButtonElement>(null);
    const [showSearchResults, setShowSearchResults] = useState(false);
    const [showNewInstituteInput, setShowNewInstituteInput] = useState(false);
    const [selectedInstitute, setSelectedInstitute] = useState<Selection>(new Set());
    const [newExternalUser, setNewExternalUser] = useState<UserSearchResult>(emptyExternalUser);

    const getInstituteDisplayValue = (key: string) =>
        mockInstitutes.find((m) => m.key == key)?.primaryValue;

    const handleConfirm = useCallback(() => {
        if (!newExternalUser) return;
        onConfirm(newExternalUser);
        onOpenChange(false);
        setNewExternalUser(emptyExternalUser);
        setSelectedInstitute(new Set());
    }, [onConfirm, onOpenChange, newExternalUser]);

    const handleCancel = useCallback(() => {
        onOpenChange(false);
        setNewExternalUser(emptyExternalUser);
        setSelectedInstitute(new Set());
    }, [onOpenChange]);

    const handleSelectInstituteChange = useCallback(
        (selected: Selection) => {
            setSelectedInstitute(selected);
            const selectedInstitute: string = [...selected][0] as string;

            if (selectedInstitute === "new-institute") {
                setShowNewInstituteInput(true);
                setShowSearchResults(false);
                return;
            }

            setNewExternalUser((prev) => ({
                ...prev,
                institute: selectedInstitute || "",
            }));
            setShowSearchResults(false);
            setShowNewInstituteInput(false);
        },
        [setShowSearchResults, setNewExternalUser],
    );

    const isValidEmail =
        newExternalUser.email != "" && /^\S+@\S+\.\S+$/.test(newExternalUser.email);
    const isCompleted =
        isValidEmail &&
        !!newExternalUser.displayName &&
        !!newExternalUser.email &&
        !!newExternalUser.institute;

    return (
        <Modal isOpen={isOpen} onOpenChange={onOpenChange}>
            <Modal.Header>{t("external_user_add.title")}</Modal.Header>
            <Modal.Body className="flex flex-col gap-4">
                <Text>{t("external_user_add.description")}</Text>

                <Input
                    label={t("name")}
                    type="text"
                    onChange={(value) =>
                        setNewExternalUser((prev) => ({
                            ...prev,
                            displayName: value,
                        }))
                    }
                />
                <Input
                    label={t("email")}
                    type="email"
                    isValid={newExternalUser.email === "" || isValidEmail}
                    errorMessage={t("external_user_add.email_error")}
                    onChange={(value) =>
                        setNewExternalUser((prev) => ({
                            ...prev,
                            email: value,
                        }))
                    }
                />

                <div>
                    <SearchInput
                        label={t("external_user_add.institute")}
                        onClick={() => setShowSearchResults(true)}
                        value={
                            [...selectedInstitute][0] === "new-institute"
                                ? t("external_user_add.new_institute_option")
                                : getInstituteDisplayValue([...selectedInstitute][0] as string)
                        }
                    />
                    {showSearchResults && (
                        <SearchListBox
                            autoFocus={false}
                            items={[
                                {
                                    key: "new-institute",
                                    primaryValue: t("external_user_add.new_institute_option"),
                                } as SearchListBoxValue,
                                ...mockInstitutes,
                            ]}
                            selectedKeys={selectedInstitute}
                            onSelectionChange={handleSelectInstituteChange}
                            selectionMode="single"
                            aria-label={
                                t("external_user_add.institute") || "Institute search results"
                            }
                        />
                    )}
                </div>
                {showNewInstituteInput && (
                    <Input
                        label={t("external_user_add.institute_new")}
                        type="text"
                        onChange={(value) =>
                            setNewExternalUser((prev) => ({
                                ...prev,
                                institute: value.replace(/\s/g, "-").toLowerCase(),
                            }))
                        }
                    />
                )}
            </Modal.Body>
            <Modal.Footer className="justify-start">
                <Button
                    intent="primary"
                    variant="destructive"
                    onClick={handleConfirm}
                    disabled={!isCompleted}
                    ref={confirmButtonRef}
                >
                    {t("confirm")}
                </Button>
                <Button intent="secondary" variant="destructive" onClick={handleCancel}>
                    {t("cancel")}
                </Button>
            </Modal.Footer>
        </Modal>
    );
};
