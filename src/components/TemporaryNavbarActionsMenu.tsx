import {useCallback, useEffect, useRef, useState} from "react";

import {Button, Card, Icon, useToast} from "@uva-fnwi/datanose-ui";

import {CreateWorkflowInstanceModal} from "./instance/CreateWorkflowInstanceModal";
import {useTranslate} from "~/hooks/useTranslate";
import {selectAccessToken} from "~/store/authSlice";
import {useAppSelector} from "~/store/store";

export function TemporaryNavbarActionsMenu() {
    const [isCreateInstanceOpen, setIsCreateInstanceOpen] = useState(false);
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);
    const {t} = useTranslate("common");
    const toast = useToast();
    const accessToken = useAppSelector(selectAccessToken);

    const handleCopyBearerToken = useCallback(async () => {
        if (!accessToken) {
            toast.error(t("copy_token_unavailable"));
            return;
        }

        try {
            await navigator.clipboard.writeText(accessToken);
            toast.success(t("copy_token_success"));
        } catch {
            toast.error(t("copy_token_failed"));
        }
    }, [accessToken, t, toast]);

    useEffect(() => {
        if (!isMenuOpen) {
            return;
        }

        const handleClickOutside = (event: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setIsMenuOpen(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [isMenuOpen]);

    return (
        <>
            <div className="relative" ref={menuRef}>
                <Button
                    intent="secondary"
                    onClick={() => setIsMenuOpen((prev) => !prev)}
                    type="button"
                    aria-label="Open actions menu"
                >
                    <Icon name="filter-horizontal-line" color="current" />
                </Button>

                {isMenuOpen && (
                    <Card className="absolute top-12 right-0 z-20 min-w-64 p-3">
                        <div className="flex flex-col gap-2">
                            <Button
                                intent="secondary"
                                onClick={() => {
                                    setIsCreateInstanceOpen(true);
                                    setIsMenuOpen(false);
                                }}
                                type="button"
                                className="w-full justify-start"
                            >
                                {t("create_instance")}
                            </Button>
                            <Button
                                intent="secondary"
                                onClick={() => {
                                    handleCopyBearerToken();
                                    setIsMenuOpen(false);
                                }}
                                type="button"
                                className="w-full justify-start"
                                leftIcon={<Icon name="copy-line" color="current" />}
                            >
                                {t("copy_token")}
                            </Button>
                        </div>
                    </Card>
                )}
            </div>
            <CreateWorkflowInstanceModal
                isOpen={isCreateInstanceOpen}
                onOpenChange={setIsCreateInstanceOpen}
            />
        </>
    );
}
