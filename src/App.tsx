import {Outlet} from "react-router";
import "./App.css";
import {VITE_WEBAPI_URL, VITE_ENV} from "./helpers/Environment";
function App() {
    return (
        <div className="app">
            <header className="header">
                <h1>Workflow UI</h1>
                <small>
                    {VITE_ENV} | {VITE_WEBAPI_URL}
                </small>
            </header>
            <main className="main">
                <Outlet />
            </main>
        </div>
    );
}

export default App;
