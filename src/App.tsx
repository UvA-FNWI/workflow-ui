import { Outlet } from "react-router";
import "./App.css";
import { VITE_WEBAPI_URL, VITE_ENV } from "./helpers/Environment";
import { ThemeProvider } from "@datanose/ui";

function App() {
  return (
    <ThemeProvider>
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
    </ThemeProvider>
  );
}

export default App;
