import {useEffect} from "react";

import {Navigate, Outlet, useLocation} from "react-router";

import {Container, useTabsWithLocalStorage} from "@uva-fnwi/datanose-ui";

import {PageHeader} from "~/components/PageHeader";
import {useVersionedNavigate, useVersionedPath} from "~/hooks/useVersionedNavigate";
import {useGetPersonalInstancesQuery} from "~/store/api/personalApi";
import {useGetAccessibleWorkflowDefinitionsQuery} from "~/store/api/workflowDefinitionsApi";
import {rememberHomePath} from "~/store/homeNavigationSlice";
import {useAppDispatch, useAppSelector} from "~/store/store";

export type HomeLayoutContext = {
    showRoleTabs: boolean;
    activeTab: number;
    onTabChange: (index: number) => void;
    showBackToChoices: boolean;
};

export function HomeLayout() {
    const {pathname} = useLocation();
    const versionedPath = useVersionedPath();
    const navigate = useVersionedNavigate();
    const dispatch = useAppDispatch();
    const {homePath, coordinatorPath, userName} = useAppSelector((state) => state.homeNavigation);
    const {data: definitions, isError} = useGetAccessibleWorkflowDefinitionsQuery();
    const {data: personal} = useGetPersonalInstancesQuery();
    const screens =
        definitions?.flatMap((definition) =>
            definition.screens.map((name) => `/screens/${definition.name}/${name}`),
        ) ?? [];
    const hasMultipleWorkflows = (definitions?.length ?? 0) > 1;
    const hasCoordinatorView = screens.length > 0;
    const hasPersonalView = (personal?.roles.length ?? 0) > 0;
    const isPersonal = pathname === "/personal";
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
    if (definitions && pathname === "/") {
        if (!hasCoordinatorView) {
            redirect = "/personal";
        } else if (!hasMultipleWorkflows) {
            redirect = coordinatorHome;
        }
    }

    useEffect(() => {
        if (definitions && !redirect && homePath !== pathname) {
            dispatch(rememberHomePath(pathname));
        }
    }, [definitions, dispatch, homePath, pathname, redirect]);

    if (redirect) return <Navigate to={versionedPath(redirect)} replace />;
    if (!definitions && !isError) {
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
                    showRoleTabs: hasCoordinatorView && hasPersonalView,
                    activeTab: isPersonal ? 1 : activeIndex,
                    onTabChange: (index) => {
                        onTabChange(index);
                        if (isPersonal && index === 0) {
                            navigate(coordinatorTarget);
                        }
                    },
                    showBackToChoices: !isPersonal && pathname !== "/" && hasMultipleWorkflows,
                } satisfies HomeLayoutContext
            }
        />
    );
}
