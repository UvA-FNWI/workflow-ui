import {Outlet} from "react-router";

import {ToastRegion} from "@datanose/ui";

import TemporaryNavbar from "./components/TemporaryNavbar";

function App() {
    return (
        <div className="min-h-screen w-full bg-grey-200 text-black dark:bg-grey-900 dark:text-white">
            <TemporaryNavbar />
            <ToastRegion />
            <main>
                <Outlet />
            </main>
        </div>
    );
}

export default App;
