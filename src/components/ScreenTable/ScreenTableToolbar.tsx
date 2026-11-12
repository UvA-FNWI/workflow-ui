import {useState} from "react";

import {Button, Icon, SearchInput} from "@uva-fnwi/datanose-ui";

import {ImportModal} from "~/components/Import/ImportModal.tsx";
import {ScreenTableFilters} from "~/components/ScreenTable/ScreenTableFilters.tsx";
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
    const [isFilterOpen, setIsFilterOpen] = useState(false);

    const [createInstance, {isLoading: isCreating}] = useCreateInstanceMutation();

    const handleCreate = async () => {
        const result = await createInstance({workflowDefinition});
        if (result.data) {
            navigate(`/instance/${result.data.id}`);
        }
    };

    return (
        <>
            <div>
                <div className="flex w-full flex-wrap items-center gap-4">
                    {bulkActions.map((action) => (
                        <Button
                            key={action.action}
                            intent="secondary"
                            variant="destructive"
                            leftIcon={
                                <Icon
                                    name={action.icon.type}
                                    size="sm"
                                    color="current"
                                    decorative
                                />
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

                    {canCreate && (
                        <div className="lg:ml-auto">
                            <Button
                                intent="secondary"
                                variant="destructive"
                                onClick={handleCreate}
                                isLoading={isCreating}
                            >
                                {t("create_new")}
                            </Button>
                        </div>
                    )}
                    <div
                        className={`order-first flex w-full flex-row items-center gap-2 lg:order-0 lg:w-auto ${canCreate ? "" : "lg:ml-auto"}`}
                    >
                        <div className="min-w-0 flex-1">
                            <SearchInput
                                aria-label={t("search_placeholder")}
                                value={search}
                                onChange={setSearch}
                                placeholder={t("search_placeholder")}
                                size="md"
                                className="w-full"
                            />
                        </div>
                        <Button
                            intent="ghost"
                            onClick={() => setIsFilterOpen(!isFilterOpen)}
                            leftIcon={<Icon name="filter-funnel-line" color="current" />}
                            className="shrink-0 underline"
                        >
                            {isFilterOpen ? t("filters.hide_filters") : t("filters.show_filters")}
                        </Button>
                    </div>
                </div>
                {isFilterOpen && (
                    <ScreenTableFilters
                        filters={[]}
                        onFilterChange={() => console.log("filter change")}
                    />
                )}
            </div>
            <ImportModal isOpen={isImportModalOpen} onClose={() => setIsImportModalOpen(false)} />
        </>
    );
};
