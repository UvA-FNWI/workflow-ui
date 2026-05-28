import {useEffect, useRef, useState} from "react";

import {Button, Card, Icon} from "@uva-fnwi/datanose-ui";

import {useTranslate} from "~/hooks/useTranslate";

type TemporaryNavbarActionsMenuProps = {
    isAuthenticated: boolean;
    onCreateInstance: () => void;
    onCopyToken: () => void;
};

export function TemporaryNavbarActionsMenu({
    onCreateInstance,
    onCopyToken,
}: TemporaryNavbarActionsMenuProps) {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);
    const {t} = useTranslate("common");

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
                                onCreateInstance();
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
                                onCopyToken();
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
    );
}
