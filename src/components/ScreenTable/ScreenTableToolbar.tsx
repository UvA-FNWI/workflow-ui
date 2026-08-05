import {useState} from "react";

import {Button, Icon, SearchInput} from "@uva-fnwi/datanose-ui";

import {ImportModal} from "~/components/Import/ImportModal.tsx";
import {useTranslate} from "~/hooks/useTranslate.ts";

type ScreenTableToolbarProps = {
    search: string;
    setSearch: (search: string) => void;
    canEdit?: boolean;
};

export const ScreenTableToolbar = ({
    search,
    setSearch,
    canEdit = false,
}: ScreenTableToolbarProps) => {
    const {t} = useTranslate("screens");
    const [isImportModalOpen, setIsImportModalOpen] = useState(false);

    return (
        <>
            <div className="flex w-full">
                {canEdit && (
                    <Button
                        intent="secondary"
                        variant="destructive"
                        leftIcon={<Icon name="download-solid" size="sm" color="current" />}
                        onClick={() => setIsImportModalOpen(true)}
                    >
                        {t("import.title")}
                    </Button>
                )}
                <div className="ml-auto">
                    <SearchInput
                        value={search}
                        onChange={setSearch}
                        placeholder={t("search_placeholder")}
                        size="md"
                    />
                </div>
            </div>
            <ImportModal isOpen={isImportModalOpen} onClose={() => setIsImportModalOpen(false)} />
        </>
    );
};
