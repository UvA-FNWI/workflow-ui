import {useState} from "react";

import {Button, Icon, SearchInput} from "@uva-fnwi/datanose-ui";

import {ImportModal} from "~/components/Import/ImportModal.tsx";
import {useTranslate} from "~/hooks/useTranslate.ts";
import {useVersionedNavigate} from "~/hooks/useVersionedNavigate.ts";
import {useCreateInstanceMutation} from "~/store/api/instancesApi.ts";
import {type FromScreen, instanceFromScreenState} from "~/utils/overviewEntries";

type ScreenTableToolbarProps = {
    search: string;
    setSearch: (search: string) => void;
    canEdit: boolean;
    canCreate: boolean;
    workflowDefinition: string;
    parentId?: string;
    fromScreen?: FromScreen;
};

export const ScreenTableToolbar = ({
    search,
    setSearch,
    canEdit,
    canCreate,
    workflowDefinition,
    parentId,
    fromScreen,
}: ScreenTableToolbarProps) => {
    const {t} = useTranslate("screens");
    const [isImportModalOpen, setIsImportModalOpen] = useState(false);
    const navigate = useVersionedNavigate();

    const [createInstance, {isLoading: isCreating}] = useCreateInstanceMutation();

    const handleCreate = async () => {
        const result = await createInstance({workflowDefinition, parentId});
        if (result.data) {
            navigate(`/instance/${result.data.id}`, {
                state: fromScreen ? instanceFromScreenState(fromScreen) : undefined,
            });
        }
    };

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

                <div className="ml-auto flex items-center gap-4">
                    {canCreate && (
                        <Button
                            intent="secondary"
                            variant="destructive"
                            onClick={handleCreate}
                            isLoading={isCreating}
                        >
                            {t("create_new")}
                        </Button>
                    )}
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
