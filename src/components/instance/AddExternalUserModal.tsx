import {useCallback, useMemo, useRef, useState} from "react";

import {Button, Input, Modal, Text} from "@datanose/ui";

import {SearchAndSelect} from "~/components/instance/SearchAndSelect.tsx";
import {useMockLazyFindInstitutesQuery} from "~/hooks/useMockLazyFindInstitutesQuery.ts";
import {useTranslate} from "~/hooks/useTranslate.ts";
import type {UserSearchResult} from "~/store/api/types/users.ts";

// Selection type from react-stately
type Selection = "all" | Set<string | number>;

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
    const [showNewInstituteInput, setShowNewInstituteInput] = useState(false);
    const [selectedInstitute, setSelectedInstitute] = useState<Selection>(new Set());
    const [newExternalUser, setNewExternalUser] = useState<UserSearchResult>(emptyExternalUser);

    const [triggerSearch, searchState, resetSearch] = useMockLazyFindInstitutesQuery();
    const searchResults = useMemo(() => searchState.data ?? [], [searchState]);

    const handleConfirm = useCallback(() => {
        if (!newExternalUser) return;
        onConfirm(newExternalUser);
        onOpenChange(false);
        setNewExternalUser(emptyExternalUser);
        setSelectedInstitute(new Set());
        setShowNewInstituteInput(false);
    }, [onConfirm, onOpenChange, newExternalUser]);

    const handleCancel = useCallback(() => {
        onOpenChange(false);
        setNewExternalUser(emptyExternalUser);
        setSelectedInstitute(new Set());
        setShowNewInstituteInput(false);
    }, [onOpenChange]);

    const handleSelectInstituteChange = useCallback(
        (selected: Selection) => {
            setSelectedInstitute(selected);
            const selectedInstitute: string = [...selected][0] as string;

            if (selectedInstitute === "new-item") {
                setShowNewInstituteInput(true);
                setNewExternalUser((prev) => ({
                    ...prev,
                    institute: "",
                }));
                return;
            }

            setNewExternalUser((prev) => ({
                ...prev,
                institute: selectedInstitute || "",
            }));
            setShowNewInstituteInput(false);
        },
        [setNewExternalUser],
    );

    const isValidEmail =
        newExternalUser.email != "" &&
        /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(newExternalUser.email);
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

                <SearchAndSelect
                    label={t("external_user_add.institute")}
                    items={searchResults}
                    selectedKeys={selectedInstitute}
                    onSelect={handleSelectInstituteChange}
                    onSearch={triggerSearch}
                    resetSearch={resetSearch}
                    isLoading={searchState.isLoading || searchState.isFetching}
                    addNewItemVisible={true}
                    showSearchHint={false}
                />

                {showNewInstituteInput && (
                    <Input
                        label={t("external_user_add.new_institute")}
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
