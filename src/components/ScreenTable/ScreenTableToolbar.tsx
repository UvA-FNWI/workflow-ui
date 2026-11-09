import {useState} from "react";

import {Button, Icon, SearchInput} from "@uva-fnwi/datanose-ui";

import {ImportModal} from "~/components/Import/ImportModal.tsx";
import {useTranslate} from "~/hooks/useTranslate.ts";
import {useVersionedNavigate} from "~/hooks/useVersionedNavigate.ts";
import {useCreateInstanceMutation} from "~/store/api/instancesApi.ts";
import type {BulkAction} from "~/store/api/types/screens";

type ScreenTableToolbarProps = {
    search: string;
    setSearch: (search: string) => void;
    canEdit: boolean;
    canCreate: boolean;
    workflowDefinition: string;
    bulkActions?: BulkAction[];
    selectedCount?: number;
    onBulkAction?: (action: BulkAction) => void;
};

export const ScreenTableToolbar = ({
    search,
    setSearch,
    canEdit,
    canCreate,
    workflowDefinition,
    bulkActions = [],
    selectedCount = 0,
    onBulkAction,
}: ScreenTableToolbarProps) => {
    const {t, l} = useTranslate("screens");
    const [isImportModalOpen, setIsImportModalOpen] = useState(false);
    const navigate = useVersionedNavigate();

    const [createInstance, {isLoading: isCreating}] = useCreateInstanceMutation();

    const handleCreate = async () => {
        const result = await createInstance({workflowDefinition});
        if (result.data) {
            navigate(`/instance/${result.data.id}`);
        }
    };

    return (
        <>
            <div className="flex w-full flex-wrap items-center gap-4">
                {bulkActions.map((action) => (
                    <Button
                        key={action.action}
                        intent="secondary"
                        variant="destructive"
                        leftIcon={
                            <Icon name={action.icon.type} size="sm" color="current" decorative />
                        }
                        disabled={selectedCount === 0}
                        onClick={() => onBulkAction?.(action)}
                    >
                        {l(action.label)}
                    </Button>
                ))}
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
                        aria-label={t("search_placeholder")}
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
