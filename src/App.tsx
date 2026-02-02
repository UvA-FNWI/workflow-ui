import {Outlet} from "react-router";

import TemporaryNavbar from "./components/TemporaryNavbar";

function App() {
    return (
        <div className="min-h-screen w-full bg-grey-200 text-black dark:bg-grey-900 dark:text-white">
            <TemporaryNavbar />
            <main className="mx-auto w-full max-w-7xl px-6 py-8">
                <Outlet />
            </main>
        </div>
    );
}

export default App;
