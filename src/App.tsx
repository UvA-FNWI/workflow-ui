import {Outlet} from "react-router";

import {
    EnvViewToggle,
    PageMark,
    ToastRegion,
    useEnvData,
    useProductionView,
} from "@uva-fnwi/datanose-ui";

import EffectsWrapper from "./components/EffectsWrapper";
import TemporaryNavbar from "./components/TemporaryNavbar";
import {ErrorWrapper} from "~/components/ErrorWrapper.tsx";
import {PreviewBanner} from "~/components/PreviewBanner";
import {VITE_ENV} from "~/helpers/Environment";

function App() {
    const envData = useEnvData(VITE_ENV);
    const {isProductionView} = useProductionView();

    return (
        <div
            className={`min-h-screen w-full text-black dark:bg-stone-900 dark:text-white ${!isProductionView && envData ? envData.bgClassName : "bg-grey-300"}`}
        >
            <TemporaryNavbar />
            <PreviewBanner />
            <EffectsWrapper />
            <ErrorWrapper />

            <ToastRegion />
            <main>
                <Outlet />
            </main>
            {envData && !isProductionView && (
                <PageMark label={envData.label} variant={envData.variant} />
            )}
            {envData && <EnvViewToggle />}
        </div>
    );
}

export default App;
