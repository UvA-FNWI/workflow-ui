import {Outlet} from "react-router";

import {
    EnvViewToggle,
    PageMark,
    ToastRegion,
    useEnvData,
    useProductionView,
} from "@uva-fnwi/datanose-ui";

import EffectsWrapper from "./components/EffectsWrapper";
import Navbar from "./components/Navbar/Navbar";
import {ErrorWrapper} from "~/components/ErrorWrapper.tsx";
import {PreviewBanner} from "~/components/PreviewBanner";
import {VITE_ENV} from "~/helpers/Environment";

function App() {
    const envData = useEnvData(VITE_ENV);
    const {isProductionView} = useProductionView();
    const backgroundClassName = `dark:bg-stone-900 ${!isProductionView && envData ? envData.bgClassName : "bg-grey-300"}`;

    return (
        <div
            className={`flex h-dvh w-full flex-col overflow-hidden text-black dark:text-white ${backgroundClassName}`}
        >
            <div className="shrink-0">
                <Navbar />
                <PreviewBanner />
            </div>
            <EffectsWrapper />
            <ErrorWrapper />

            <ToastRegion />
            <main
                className={`min-h-0 flex-1 overflow-y-auto ${backgroundClassName}`}
                style={{scrollbarGutter: "stable both-edges"}}
            >
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
