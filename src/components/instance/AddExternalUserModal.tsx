import {useCallback, useMemo, useState} from "react";

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
    const [selectedInstitute, setSelectedInstitute] = useState<Selection>(new Set());
    const [newExternalUser, setNewExternalUser] = useState<UserSearchResult>(emptyExternalUser);

    const [triggerSearch, searchState, resetSearch] = useMockLazyFindInstitutesQuery();
    const searchResults = useMemo(() => searchState.data ?? [], [searchState]);

    const updateExternalUser = useCallback((updates: Partial<UserSearchResult>) => {
        setNewExternalUser((prev) => ({
            ...prev,
            ...updates,
        }));
    }, []);

    const handleModalOpenChange = useCallback(
        (nextIsOpen: boolean) => {
            if (!nextIsOpen) {
                setNewExternalUser(emptyExternalUser);
                setSelectedInstitute(new Set());
            }
            onOpenChange(nextIsOpen);
        },
        [onOpenChange],
    );

    const handleConfirm = useCallback(() => {
        onConfirm(newExternalUser);
        handleModalOpenChange(false);
    }, [onConfirm, handleModalOpenChange, newExternalUser]);

    const handleSelectInstituteChange = useCallback(
        (selected: Selection) => {
            setSelectedInstitute(selected);
            const selectedInstitute = [...selected][0] as string;

            if (selectedInstitute === "new-item") {
                updateExternalUser({institute: ""});
                return;
            }

            updateExternalUser({institute: selectedInstitute || ""});
        },
        [updateExternalUser],
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
                    onChange={(value) => updateExternalUser({displayName: value})}
                />
                <Input
                    label={t("email")}
                    type="email"
                    isValid={newExternalUser.email === "" || isValidEmail}
                    errorMessage={t("external_user_add.email_error")}
                    onChange={(value) => updateExternalUser({email: value})}
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

                {selectedInstitute instanceof Set && selectedInstitute.has("new-item") && (
                    <Input
                        label={t("external_user_add.new_institute")}
                        type="text"
                        onChange={(value) =>
                            updateExternalUser({institute: value.replace(/\s/g, "-").toLowerCase()})
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
                >
                    {t("confirm")}
                </Button>
                <Button
                    intent="secondary"
                    variant="destructive"
                    onClick={() => handleModalOpenChange(false)}
                >
                    {t("cancel")}
                </Button>
            </Modal.Footer>
        </Modal>
    );
};
