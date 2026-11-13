import {useEffect} from "react";

import {Navigate, Outlet, useLocation} from "react-router";

import {Container, Text, useTabsWithLocalStorage} from "@uva-fnwi/datanose-ui";

import {PageHeader} from "~/components/PageHeader";
import {useAuthenticatedUser} from "~/hooks/useAuthenticatedUser";
import {useTranslate} from "~/hooks/useTranslate";
import {useVersionedNavigate} from "~/hooks/useVersionedNavigate";
import {useGetPersonalInstancesQuery} from "~/store/api/personalApi";
import type {WorkflowDefinition} from "~/store/api/types/workflowDefinitions";
import {useGetAccessibleWorkflowDefinitionsQuery} from "~/store/api/workflowDefinitionsApi";
import {rememberHomePath} from "~/store/homeNavigationSlice";
import {useAppDispatch, useAppSelector} from "~/store/store";

export type HomeLayoutContext = {
    definitions: WorkflowDefinition[] | undefined;
    showRoleTabs: boolean;
    activeTab: number;
    onTabChange: (index: number) => void;
    showBackToChoices: boolean;
};

export function HomeLayout() {
    const {t} = useTranslate("workflow");
    const {pathname, search} = useLocation();
    const navigate = useVersionedNavigate();
    const dispatch = useAppDispatch();
    const {homePath, coordinatorPath, userName} = useAppSelector((state) => state.homeNavigation);
    const {currentUser, isLoading: isCurrentUserLoading} = useAuthenticatedUser();
    const {data: definitions, isError} = useGetAccessibleWorkflowDefinitionsQuery();
    const {data: personal, isLoading: isPersonalLoading} = useGetPersonalInstancesQuery();
    const screens =
        definitions?.flatMap((definition) =>
            definition.screens.map((name) => `/screens/${definition.name}/${name}`),
        ) ?? [];
    const hasMultipleWorkflows = (definitions?.length ?? 0) > 1;
    const hasCoordinatorView = screens.length > 0;
    const hasPersonalView = (personal?.roles.length ?? 0) > 0;
    const isHome = pathname === "/";
    const isPersonal = pathname === "/personal";
    const canSearchPeople = currentUser?.canSearchPeople ?? false;
    const isSearchAccessLoading = isHome && !currentUser && isCurrentUserLoading;
    const coordinatorHome = hasMultipleWorkflows ? "/" : (screens[0] ?? "/personal");
    const coordinatorTarget = screens.includes(coordinatorPath) ? coordinatorPath : coordinatorHome;
    const {activeIndex, onTabChange} = useTabsWithLocalStorage({
        tabs: ["coordinator", "personal"],
        storageKey: [
            "workflow",
            "home",
            userName,
            isPersonal ? coordinatorTarget : pathname,
            "active-tab",
        ]
            .map(encodeURIComponent)
            .join(":"),
    });

    let redirect: string | undefined;
    if (definitions && isHome && !canSearchPeople && !isSearchAccessLoading) {
        if (!hasCoordinatorView) {
            redirect = "/personal";
        } else if (!hasMultipleWorkflows) {
            redirect = coordinatorHome;
        }
    }

    useEffect(() => {
        if (definitions && !redirect && !isSearchAccessLoading && homePath !== pathname) {
            dispatch(rememberHomePath(pathname));
        }
    }, [definitions, dispatch, homePath, isSearchAccessLoading, pathname, redirect]);

    if (redirect) return <Navigate to={{pathname: redirect, search}} replace />;
    if (isHome && isError && !definitions) {
        return (
            <Container maxWidth={1280}>
                <PageHeader title={t("home")} />
                <Text role="alert" intent="error">
                    {t("overview.load_error")}
                </Text>
            </Container>
        );
    }
    if ((!definitions && !isError) || isPersonalLoading || isSearchAccessLoading) {
        return (
            <Container maxWidth={1280}>
                <PageHeader title={null} isLoading />
            </Container>
        );
    }

    return (
        <Outlet
            context={
                {
                    definitions,
                    showRoleTabs: hasCoordinatorView && hasPersonalView,
                    activeTab: isPersonal ? 1 : activeIndex,
                    onTabChange: (index) => {
                        onTabChange(index);
                        if (isPersonal && index === 0) {
                            navigate(coordinatorTarget);
                        }
                    },
                    showBackToChoices:
                        !isHome && (canSearchPeople || (!isPersonal && hasMultipleWorkflows)),
                } satisfies HomeLayoutContext
            }
        />
    );
}
