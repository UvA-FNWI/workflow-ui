import {Button, cn, Icon, Menu} from "@uva-fnwi/datanose-ui";
import type {MenuItemDefinition} from "@uva-fnwi/datanose-ui";

import {UserAvatar} from "~/components/instance/UserAvatar";
import {useLanguageMenuItem} from "~/components/Navbar/LanguageMenu";
import {useVersionMenuItem} from "~/components/Navbar/VersionMenu";
import {useTranslate} from "~/hooks/useTranslate";

interface NavbarUserProps {
    displayName: string;
    showVersionPicker?: boolean;
    onStartImpersonation?: () => void;
    onStopImpersonation?: () => void;
    onLogout: () => void | Promise<void>;
}

export function NavbarUser({
    displayName,
    showVersionPicker = false,
    onStartImpersonation,
    onStopImpersonation,
    onLogout,
}: NavbarUserProps) {
    const {t} = useTranslate("common");
    const isImpersonating = !!onStopImpersonation;
    const languageMenuItem = useLanguageMenuItem();
    const versionMenuItem = useVersionMenuItem(showVersionPicker);
    const items: MenuItemDefinition[] = [];

    if (onStartImpersonation) {
        items.push({
            id: "impersonate",
            textValue: t("impersonate"),
            cursor: "pointer",
            onAction: onStartImpersonation,
            content: (
                <>
                    <Icon name="touch-id-line" size="lg" color="current" decorative />
                    <span>{t("impersonate")}</span>
                </>
            ),
        });
    }

    if (onStopImpersonation) {
        items.push({
            id: "stop-impersonation",
            textValue: t("stop_impersonation"),
            cursor: "pointer",
            onAction: onStopImpersonation,
            content: (
                <>
                    <Icon name="cross-small-line" size="lg" color="current" decorative />
                    <span>{t("stop_impersonation")}</span>
                </>
            ),
        });
    }

    items.push(languageMenuItem);

    if (versionMenuItem) {
        items.push(versionMenuItem);
    }

    items.push({
        id: "logout",
        textValue: t("logout"),
        cursor: "pointer",
        onAction: () => void onLogout(),
        content: (
            <>
                <Icon name="logout-line" size="lg" color="current" decorative />
                <span>{t("logout")}</span>
            </>
        ),
    });

    return (
        <Menu
            ariaLabel={t("user_menu")}
            items={items}
            placement="bottom end"
            trigger={({isOpen, triggerProps, triggerRef}) => (
                <Button
                    {...triggerProps}
                    ref={triggerRef}
                    aria-label={`${t("user_menu")}: ${displayName}`}
                    intent={"ghost"}
                    size="large"
                    width="none"
                    className={cn(
                        "h-auto max-w-72 gap-2 p-1",
                        isImpersonating &&
                            "rounded-md bg-amber-100 text-amber-900 hover:bg-amber-200",
                    )}
                >
                    <div className="flex flex-row items-center gap-2">
                        <UserAvatar userName={displayName} size="small" />
                        <span className="min-w-0 truncate">
                            {isImpersonating
                                ? t("impersonating_as", {name: displayName})
                                : displayName}
                        </span>
                        <Icon
                            name={isOpen ? "chevron-up-small-line" : "chevron-down-small-line"}
                            size="sm"
                            color="current"
                            decorative
                        />
                    </div>
                </Button>
            )}
        />
    );
}
