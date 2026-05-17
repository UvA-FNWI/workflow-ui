import {Outlet} from "react-router";

import {ToastRegion} from "@uva-fnwi/datanose-ui";

import EffectsWrapper from "./components/EffectsWrapper";
import TemporaryNavbar from "./components/TemporaryNavbar";

function App() {
    return (
        <div className="min-h-screen w-full bg-grey-300 text-black dark:bg-stone-900 dark:text-white">
            <TemporaryNavbar />
            <EffectsWrapper />

            <ToastRegion />
            <main>
                <Outlet />
            </main>
        </div>
    );
}

export default App;
