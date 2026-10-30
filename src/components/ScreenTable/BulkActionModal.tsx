import {Button, Modal, Text} from "@uva-fnwi/datanose-ui";

import {ScreenTable} from "./ScreenTable";
import {useTranslate} from "~/hooks/useTranslate";
import {useExecuteBulkActionMutation, usePreviewBulkActionQuery} from "~/store/api/screensApi";
import type {BulkAction, ScreenColumn, ScreenRow} from "~/store/api/types/screens";

type Props = {
    workflowDefinition: string;
    screenName: string;
    action: BulkAction;
    columns: ScreenColumn[];
    rows: ScreenRow[];
    onClose: () => void;
    onComplete: () => void;
};

export function BulkActionModal({
    workflowDefinition,
    screenName,
    action,
    columns,
    rows,
    onClose,
    onComplete,
}: Props) {
    const {t, l} = useTranslate("screens");
    const params = {
        workflowDefinition,
        screenName,
        actionName: action.action,
        instanceIds: rows.map((row) => row.id),
    };
    const {
        currentData: preview,
        isFetching,
        isError: previewError,
    } = usePreviewBulkActionQuery(params, {refetchOnMountOrArgChange: true});
    const [execute, {data: result, isLoading, isError: executionError, isUninitialized}] =
        useExecuteBulkActionMutation();
    const eligibleIds = new Set(
        preview?.rows.filter((row) => row.status === "Eligible").map((row) => row.instanceId),
    );
    const eligibleRows = rows.filter((row) => eligibleIds.has(row.id));
    const unavailableRows = rows.filter((row) => !eligibleIds.has(row.id));
    const noneEligible =
        Boolean(preview) && !isFetching && !previewError && eligibleRows.length === 0;
    const finished = !isUninitialized && !isLoading;
    const succeeded = result?.rows.filter((row) => row.status === "Succeeded").length ?? 0;
    const allSucceeded =
        result !== undefined && result.rows.length > 0 && succeeded === result.rows.length;
    const unsuccessfulIds = new Set(
        result?.rows.filter((row) => row.status !== "Succeeded").map((row) => row.instanceId),
    );

    return (
        <Modal
            isOpen
            size="xl"
            aria-label={l(action.label)}
            showCloseButton={!isLoading}
            isDismissable={!isLoading}
            isKeyboardDismissDisabled={isLoading}
            onOpenChange={(open) => {
                if (!open && !isLoading) onClose();
            }}
        >
            <Modal.Header>{l(action.label)}</Modal.Header>
            <Modal.Body className="flex flex-col gap-4">
                {isLoading ? (
                    <Text role="status">{t("bulk.executing")}</Text>
                ) : finished ? (
                    executionError ? (
                        <Text role="alert" intent="error">
                            {t("bulk.unknown_result")}
                        </Text>
                    ) : (
                        <>
                            <Text
                                role={allSucceeded ? "status" : "alert"}
                                intent={allSucceeded ? "primary" : "error"}
                            >
                                {allSucceeded
                                    ? t("bulk.success", {count: succeeded})
                                    : t("bulk.completed_with_errors", {
                                          successful: succeeded,
                                          total: result?.rows.length ?? eligibleRows.length,
                                      })}
                            </Text>
                            {!allSucceeded && result && (
                                <ScreenTable
                                    columns={columns}
                                    rows={rows.filter((row) => unsuccessfulIds.has(row.id))}
                                    showInstanceLink={false}
                                />
                            )}
                        </>
                    )
                ) : isFetching ? (
                    <Text role="status">{t("bulk.checking")}</Text>
                ) : previewError ? (
                    <Text role="alert" intent="error">
                        {t("bulk.preview_failed")}
                    </Text>
                ) : preview ? (
                    <>
                        <p>
                            {noneEligible
                                ? t("bulk.confirm_none", {
                                      count: rows.length,
                                      action: l(action.label),
                                  })
                                : eligibleRows.length === rows.length
                                  ? t("bulk.confirm_all", {
                                        count: rows.length,
                                        selected: rows.length,
                                        action: l(action.label),
                                    })
                                  : t("bulk.confirm_some", {
                                        count: unavailableRows.length,
                                        selected: rows.length,
                                        action: l(action.label),
                                        eligible: eligibleRows.length,
                                    })}
                        </p>
                        {eligibleRows.length > 0 && (
                            <section aria-label={t("bulk.eligible")}>
                                <h3 className="mb-2 font-semibold">{t("bulk.eligible")}</h3>
                                <ScreenTable
                                    columns={columns}
                                    rows={eligibleRows}
                                    showInstanceLink={false}
                                />
                            </section>
                        )}
                        {unavailableRows.length > 0 && (
                            <section aria-label={t("bulk.unavailable")}>
                                <h3 className="mb-2 font-semibold">{t("bulk.unavailable")}</h3>
                                <ScreenTable
                                    columns={columns}
                                    rows={unavailableRows}
                                    showInstanceLink={false}
                                />
                            </section>
                        )}
                    </>
                ) : null}
            </Modal.Body>
            <Modal.Footer>
                {!finished && !noneEligible && (
                    <Button
                        intent="primary"
                        variant="destructive"
                        isLoading={isLoading}
                        disabled={
                            isLoading || isFetching || previewError || eligibleRows.length === 0
                        }
                        onClick={async () => {
                            await execute({
                                ...params,
                                instanceIds: eligibleRows.map((row) => row.id),
                            });
                            onComplete();
                        }}
                    >
                        {t("bulk.confirm")}
                    </Button>
                )}
                {!isLoading && (
                    <Button intent="secondary" onClick={onClose}>
                        {finished || noneEligible ? t("bulk.close") : t("bulk.cancel")}
                    </Button>
                )}
            </Modal.Footer>
        </Modal>
    );
}
