import {Outlet} from "react-router";

import {useTheme} from "@datanose/ui";

import {VITE_ENV, VITE_WEBAPI_URL} from "./helpers/Environment";

function App() {
    const {resolvedTheme, setTheme} = useTheme();

    const handleThemeToggle = () => {
        const newTheme = resolvedTheme === "light" ? "dark" : "light";
        setTheme(newTheme);
    };

    return (
        <div className="bg-grey-200 dark:bg-grey-900 min-h-screen w-full text-black dark:text-white">
            <header className="header">
                <h1>Workflow UI</h1>
                <small>
                    {VITE_ENV} | {VITE_WEBAPI_URL}
                </small>
            </header>
            <main className="main">
                <button
                    className="border-grey-300 dark:border-grey-700 dark:bg-grey-800 text-grey-900 dark:text-grey-100 hover:bg-grey-100 dark:hover:bg-grey-700 rounded border bg-white px-3 py-1 transition"
                    onClick={handleThemeToggle}
                >
                    Switch to {resolvedTheme === "light" ? "Dark" : "Light"} Mode
                </button>
                <Outlet />
            </main>
        </div>
    );
}

export default App;
