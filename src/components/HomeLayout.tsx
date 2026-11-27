import {useEffect} from "react";

import {Navigate, Outlet, useLocation} from "react-router";

import {Container, Text, useTabsWithLocalStorage} from "@uva-fnwi/datanose-ui";

import {PageHeader} from "~/components/PageHeader";
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
    const {data: definitions, isError} = useGetAccessibleWorkflowDefinitionsQuery();
    const {data: personal, isLoading: isPersonalLoading} = useGetPersonalInstancesQuery();
    const screens =
        definitions?.flatMap((definition) =>
            definition.screens.map((screen) => `/screens/${definition.name}/${screen.name}`),
        ) ?? [];
    const hasCoordinatorView = screens.length > 0;
    const hasPersonalView = (personal?.roles.length ?? 0) > 0;
    const isHome = pathname === "/";
    const isPersonal = pathname === "/personal";
    const redirectToPersonal = definitions && isHome && !hasCoordinatorView;
    const coordinatorTarget = screens.includes(coordinatorPath) ? coordinatorPath : "/";
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

    useEffect(() => {
        if (definitions && !redirectToPersonal && homePath !== pathname) {
            dispatch(rememberHomePath(pathname));
        }
    }, [definitions, dispatch, homePath, pathname, redirectToPersonal]);

    if (redirectToPersonal) return <Navigate to={{pathname: "/personal", search}} replace />;
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
    if ((!definitions && !isError) || isPersonalLoading) {
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
                    showBackToChoices: !isHome && hasCoordinatorView,
                } satisfies HomeLayoutContext
            }
        />
    );
}
