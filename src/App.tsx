import {Outlet} from "react-router";

import {PageMark, ToastRegion, useEnvData} from "@uva-fnwi/datanose-ui";

import EffectsWrapper from "./components/EffectsWrapper";
import TemporaryNavbar from "./components/TemporaryNavbar";
import {ErrorWrapper} from "~/components/ErrorWrapper.tsx";
import {VITE_ENV} from "~/helpers/Environment";

function App() {
    const envData = useEnvData(VITE_ENV);

    return (
        <div
            className={`min-h-screen w-full bg-grey-300 text-black dark:bg-stone-900 dark:text-white ${envData?.bgClassName ?? ""}`}
        >
            <TemporaryNavbar />
            <EffectsWrapper />
            <ErrorWrapper />

            <ToastRegion />
            <main>
                <Outlet />
            </main>
            {envData && <PageMark label={envData.label} variant={envData.variant} />}
        </div>
    );
}

export default App;
