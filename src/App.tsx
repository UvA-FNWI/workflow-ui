import {Outlet} from "react-router";

import {ToastRegion} from "@datanose/ui";

import TemporaryNavbar from "./components/TemporaryNavbar";

function App() {
    return (
        <div className="bg-grey-200 dark:bg-grey-900 min-h-screen w-full text-black dark:text-white">
            <TemporaryNavbar />
            <ToastRegion />
            <main className="mx-auto w-full max-w-7xl px-6 py-8">
                <Outlet />
            </main>
        </div>
    );
}

export default App;
