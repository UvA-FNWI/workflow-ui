import {Button, Icon, Menu} from "@uva-fnwi/datanose-ui";
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
            onAction: onStartImpersonation,
            icon: "touch-id-line",
            content: t("impersonate"),
        });
    }

    if (onStopImpersonation) {
        items.push({
            id: "stop-impersonation",
            onAction: onStopImpersonation,
            icon: "cross-small-line",
            content: t("stop_impersonation"),
        });
    }

    items.push(languageMenuItem);

    if (versionMenuItem) {
        items.push(versionMenuItem);
    }

    items.push({
        id: "logout",
        onAction: () => void onLogout(),
        icon: "logout-line",
        content: t("logout"),
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
                    intent={isImpersonating ? "secondary" : "ghost"}
                    variant={isImpersonating ? "destructive" : "default"}
                    leftIcon={
                        isImpersonating ? (
                            <Icon
                                className="h-9"
                                name="touch-id-line"
                                size="lg"
                                color="current"
                                decorative
                            />
                        ) : undefined
                    }
                    size="large"
                    width="none"
                    className={"h-auto max-w-72 gap-2 p-1"}
                >
                    <div className="flex flex-row items-center gap-2">
                        {isImpersonating == false && (
                            <UserAvatar userName={displayName} size="small" />
                        )}
                        <span className="min-w-0 truncate">
                            {isImpersonating ? (
                                <>
                                    {t("impersonating_as")}{" "}
                                    <strong className="font-bold">{displayName}</strong>
                                </>
                            ) : (
                                displayName
                            )}
                        </span>
                        <Icon
                            name={isOpen ? "chevron-up-small-line" : "chevron-down-small-line"}
                            size="md"
                            color="current"
                            decorative
                        />
                    </div>
                </Button>
            )}
        />
    );
}
